from fastapi import FastAPI, APIRouter, HTTPException, Depends, status, UploadFile, File, Form
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
from dotenv import load_dotenv
from passlib.context import CryptContext
from jose import JWTError, jwt
import os
import logging
from pathlib import Path
import uuid
import base64
import smtplib
import ssl

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Security
SECRET_KEY = os.environ.get('SECRET_KEY', 'your-secret-key-here-change-in-production')
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBearer()

app = FastAPI(title="Odon Lab CMS API", version="1.0.0")
api_router = APIRouter(prefix="/api")

# Pydantic Models
class User(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    username: str
    email: str
    hashed_password: str
    is_active: bool = True
    is_admin: bool = False
    created_at: datetime = Field(default_factory=datetime.utcnow)

class UserCreate(BaseModel):
    username: str
    email: str
    password: str

class UserLogin(BaseModel):
    username: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

class PageContent(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    page_name: str
    title: str
    subtitle: Optional[str] = None
    content: Dict[str, Any] = Field(default_factory=dict)
    meta_description: Optional[str] = None
    meta_keywords: Optional[str] = None
    is_published: bool = True
    order: Optional[int] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class PageContentCreate(BaseModel):
    page_name: str
    title: str
    subtitle: Optional[str] = None
    content: Dict[str, Any] = Field(default_factory=dict)
    meta_description: Optional[str] = None
    meta_keywords: Optional[str] = None
    is_published: bool = True
    order: Optional[int] = None

class PageContentUpdate(BaseModel):
    title: Optional[str] = None
    subtitle: Optional[str] = None
    content: Optional[Dict[str, Any]] = None
    meta_description: Optional[str] = None
    meta_keywords: Optional[str] = None
    is_published: Optional[bool] = None
    order: Optional[int] = None

class Project(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    description: str
    key_areas: str
    icon: str
    order: int = 0
    is_published: bool = True
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class ProjectCreate(BaseModel):
    title: str
    description: str
    key_areas: str
    icon: str
    order: int = 0
    is_published: bool = True

class ProjectUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    key_areas: Optional[str] = None
    icon: Optional[str] = None
    order: Optional[int] = None
    is_published: Optional[bool] = None

class SiteSettings(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    site_name: str
    site_description: str
    contact_email: str
    contact_phone: str
    address: str
    logo_url: Optional[str] = None
    hero_image_url: Optional[str] = None
    theme_colors: Dict[str, str]
    social_links: Dict[str, str]
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class SiteSettingsUpdate(BaseModel):
    site_name: Optional[str] = None
    site_description: Optional[str] = None
    contact_email: Optional[str] = None
    contact_phone: Optional[str] = None
    address: Optional[str] = None
    logo_url: Optional[str] = None
    hero_image_url: Optional[str] = None
    theme_colors: Optional[Dict[str, str]] = None
    social_links: Optional[Dict[str, str]] = None

class MediaFile(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    filename: str
    original_filename: str
    file_type: str
    file_size: int
    file_data: str  # Base64 encoded file data
    uploaded_at: datetime = Field(default_factory=datetime.utcnow)

class ContactForm(BaseModel):
    name: str
    email: str
    subject: str
    message: str

# Helper Functions
def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    user = await db.users.find_one({"username": username})
    if user is None:
        raise credentials_exception
    return User(**user)

async def get_current_admin_user(current_user: User = Depends(get_current_user)):
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    return current_user

# Initialize default admin user
async def init_default_admin():
    admin_exists = await db.users.find_one({"username": "admin"})
    if not admin_exists:
        admin_user = User(
            username="admin",
            email="admin@odonlab.com",
            hashed_password=get_password_hash("admin123"),
            is_admin=True
        )
        await db.users.insert_one(admin_user.dict())
        print("Default admin user created: admin/admin123")

# Authentication Routes
@api_router.post("/auth/register", response_model=User)
async def register(user: UserCreate):
    existing_user = await db.users.find_one({"username": user.username})
    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="Username already registered"
        )
    
    hashed_password = get_password_hash(user.password)
    new_user = User(
        username=user.username,
        email=user.email,
        hashed_password=hashed_password
    )
    await db.users.insert_one(new_user.dict())
    return new_user

@api_router.post("/auth/login", response_model=Token)
async def login(user: UserLogin):
    db_user = await db.users.find_one({"username": user.username})
    if not db_user or not verify_password(user.password, db_user["hashed_password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": db_user["username"]}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@api_router.get("/auth/me", response_model=User)
async def read_users_me(current_user: User = Depends(get_current_user)):
    return current_user

# Page Content Routes
@api_router.get("/pages", response_model=List[PageContent])
async def get_pages():
    pages = await db.pages.find().sort("order", 1).to_list(1000)
    return [PageContent(**page) for page in pages]

@api_router.get("/pages/published", response_model=List[PageContent])
async def get_published_pages():
    pages = await db.pages.find({"is_published": True}).sort("order", 1).to_list(1000)
    return [PageContent(**page) for page in pages]

@api_router.get("/pages/{page_name}", response_model=PageContent)
async def get_page(page_name: str):
    page = await db.pages.find_one({"page_name": page_name})
    if not page:
        raise HTTPException(status_code=404, detail="Page not found")
    return PageContent(**page)

@api_router.post("/pages", response_model=PageContent)
async def create_page(page: PageContentCreate):
    # Check if page name already exists
    existing_page = await db.pages.find_one({"page_name": page.page_name})
    if existing_page:
        raise HTTPException(
            status_code=400,
            detail="Page with this name already exists"
        )
    
    page_dict = page.dict()
    page_obj = PageContent(**page_dict)
    await db.pages.insert_one(page_obj.dict())
    return page_obj

@api_router.put("/pages/{page_name}", response_model=PageContent)
async def update_page(page_name: str, page_update: PageContentUpdate):
    page = await db.pages.find_one({"page_name": page_name})
    if not page:
        raise HTTPException(status_code=404, detail="Page not found")
    
    update_data = page_update.dict(exclude_unset=True)
    update_data["updated_at"] = datetime.utcnow()
    
    await db.pages.update_one({"page_name": page_name}, {"$set": update_data})
    updated_page = await db.pages.find_one({"page_name": page_name})
    return PageContent(**updated_page)

@api_router.delete("/pages/{page_name}")
async def delete_page(page_name: str):
    # Prevent deletion of home page
    if page_name == "home":
        raise HTTPException(
            status_code=400,
            detail="Cannot delete home page"
        )
    
    result = await db.pages.delete_one({"page_name": page_name})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Page not found")
    return {"message": "Page deleted successfully"}

@api_router.patch("/pages/{page_name}/toggle-status")
async def toggle_page_status(page_name: str):
    page = await db.pages.find_one({"page_name": page_name})
    if not page:
        raise HTTPException(status_code=404, detail="Page not found")
    
    new_status = not page["is_published"]
    await db.pages.update_one(
        {"page_name": page_name}, 
        {"$set": {"is_published": new_status, "updated_at": datetime.utcnow()}}
    )
    
    updated_page = await db.pages.find_one({"page_name": page_name})
    return PageContent(**updated_page)

# Project Routes
@api_router.get("/projects", response_model=List[Project])
async def get_projects():
    projects = await db.projects.find().sort("order", 1).to_list(1000)
    return [Project(**project) for project in projects]

@api_router.get("/projects/published", response_model=List[Project])
async def get_published_projects():
    projects = await db.projects.find({"is_published": True}).sort("order", 1).to_list(1000)
    return [Project(**project) for project in projects]

@api_router.get("/projects/{project_id}", response_model=Project)
async def get_project(project_id: str):
    project = await db.projects.find_one({"id": project_id})
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return Project(**project)

@api_router.post("/projects", response_model=Project)
async def create_project(project: ProjectCreate):
    project_dict = project.dict()
    project_obj = Project(**project_dict)
    await db.projects.insert_one(project_obj.dict())
    return project_obj

@api_router.put("/projects/{project_id}", response_model=Project)
async def update_project(project_id: str, project_update: ProjectUpdate):
    project = await db.projects.find_one({"id": project_id})
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    update_data = project_update.dict(exclude_unset=True)
    update_data["updated_at"] = datetime.utcnow()
    
    await db.projects.update_one({"id": project_id}, {"$set": update_data})
    updated_project = await db.projects.find_one({"id": project_id})
    return Project(**updated_project)

@api_router.delete("/projects/{project_id}")
async def delete_project(project_id: str):
    result = await db.projects.delete_one({"id": project_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Project not found")
    return {"message": "Project deleted successfully"}

@api_router.patch("/projects/{project_id}/toggle-status")
async def toggle_project_status(project_id: str):
    project = await db.projects.find_one({"id": project_id})
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    new_status = not project["is_published"]
    await db.projects.update_one(
        {"id": project_id}, 
        {"$set": {"is_published": new_status, "updated_at": datetime.utcnow()}}
    )
    
    updated_project = await db.projects.find_one({"id": project_id})
    return Project(**updated_project)

# Site Settings Routes
@api_router.get("/settings", response_model=SiteSettings)
async def get_settings():
    settings = await db.settings.find_one()
    if not settings:
        # Return default settings if none exist
        default_settings = SiteSettings(
            site_name="Odon Lab",
            site_description="Advancing virology and immunology research at the University of Strathclyde",
            contact_email="valerie.odon@strath.ac.uk",
            contact_phone="+44 (0)141 548 2000",
            address="161 Cathedral Street, Glasgow G4 0RE, Scotland, UK",
            theme_colors={
                "primary": "#3b82f6",
                "secondary": "#8b5cf6",
                "accent": "#10b981"
            },
            social_links={}
        )
        await db.settings.insert_one(default_settings.dict())
        return default_settings
    return SiteSettings(**settings)

@api_router.put("/settings", response_model=SiteSettings)
async def update_settings(settings_update: SiteSettingsUpdate):
    settings = await db.settings.find_one()
    if not settings:
        raise HTTPException(status_code=404, detail="Settings not found")
    
    update_data = settings_update.dict(exclude_unset=True)
    update_data["updated_at"] = datetime.utcnow()
    
    await db.settings.update_one({}, {"$set": update_data})
    updated_settings = await db.settings.find_one()
    return SiteSettings(**updated_settings)

# Media Management Routes
@api_router.post("/media/upload", response_model=MediaFile)
async def upload_media(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_admin_user)
):
    file_data = await file.read()
    file_base64 = base64.b64encode(file_data).decode()
    
    media_file = MediaFile(
        filename=f"{uuid.uuid4()}_{file.filename}",
        original_filename=file.filename,
        file_type=file.content_type,
        file_size=len(file_data),
        file_data=file_base64
    )
    
    await db.media.insert_one(media_file.dict())
    return media_file

@api_router.get("/media", response_model=List[MediaFile])
async def get_media():
    media_files = await db.media.find().to_list(1000)
    return [MediaFile(**media) for media in media_files]

@api_router.get("/media/{media_id}")
async def get_media_file(media_id: str):
    media = await db.media.find_one({"id": media_id})
    if not media:
        raise HTTPException(status_code=404, detail="Media file not found")
    
    file_data = base64.b64decode(media["file_data"])
    return Response(
        content=file_data,
        media_type=media["file_type"],
        headers={"Content-Disposition": f"inline; filename={media['original_filename']}"}
    )

@api_router.delete("/media/{media_id}")
async def delete_media(media_id: str):
    result = await db.media.delete_one({"id": media_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Media file not found")
    return {"message": "Media file deleted successfully"}

# Analytics and Dashboard Routes
@api_router.get("/dashboard/stats")
async def get_dashboard_stats():
    total_pages = await db.pages.count_documents({})
    published_pages = await db.pages.count_documents({"is_published": True})
    total_projects = await db.projects.count_documents({})
    published_projects = await db.projects.count_documents({"is_published": True})
    total_media = await db.media.count_documents({})
    
    return {
        "total_pages": total_pages,
        "published_pages": published_pages,
        "total_projects": total_projects,
        "published_projects": published_projects,
        "total_media": total_media
    }

@api_router.get("/contact_info")
async def get_contact_info():
    # In a real application, this would fetch data from a database or configuration
    return {
        "contact_email": "valerie.odon@strath.ac.uk",
        "contact_phone": "+44 (0)141 548 2000",
        "address": {
            "street": "161 Cathedral Street",
            "city": "Glasgow",
            "state_province": "Scotland",
            "postal_code": "G4 0RE",
            "country": "UK"
        },
        "institution": "University of Strathclyde",
        "department": "Strathclyde Institute of Pharmacy and Biomedical Sciences",
        "social_media": {
            "twitter": "#",
            "linkedin": "#",
            "facebook": "#"
        },
        "office_hours": [
            "Monday - Friday: 9:00 AM - 5:00 PM",
            "Saturday: 10:00 AM - 2:00 PM",
            "Sunday: Closed"
        ]
    }

@api_router.post("/contact")
async def contact_form_submit(form_data: ContactForm):
    sender_email = os.environ.get("EMAIL_SENDER")
    sender_password = os.environ.get("EMAIL_PASSWORD")
    receiver_emails = ["odon.laboratory@gmail.com", "valerie.odon@strath.ac.uk"]

    message = f"\nSubject: {form_data.subject}\nFrom: {form_data.name} <{form_data.email}>\n\n{form_data.message}\n"""

    context = ssl.create_default_context()
    try:
        with smtplib.SMTP_SSL("smtp.gmail.com", 465, context=context) as server:
            server.login(sender_email, sender_password)
            for receiver_email in receiver_emails:
                server.sendmail(sender_email, receiver_email, message)
        return {"message": "Email sent successfully!"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to send email: {e}")

# Initialize sample data
async def init_sample_data():
    # Check if sample data already exists
    existing_pages = await db.pages.count_documents({})
    if existing_pages > 0:
        return
    
    # Create sample pages
    sample_pages = [
        PageContent(
            page_name="home",
            title="Welcome to Odon Lab",
            subtitle="Advancing virology and immunology research at the University of Strathclyde",
            content={
                "hero_title": "Welcome to Odon Lab",
                "hero_subtitle": "Advancing virology and immunology research at the University of Strathclyde under the leadership of Dr. Valerie Odon",
                "hero_image": "https://images.pexels.com/photos/8532850/pexels-photo-8532850.jpeg",
                "about_dr_odon": "Dr. Valerie Odon is a distinguished virologist and lecturer in Immunology at the Strathclyde Institute of Pharmacy and Biomedical Sciences, University of Strathclyde. With extensive expertise in viral immunology, she leads groundbreaking research initiatives that bridge fundamental virology with clinical applications.",
                "research_interests": [
                    "Virus-host cell interactions",
                    "Innate and adaptive immune responses",
                    "Viral pathogenesis mechanisms",
                    "Antiviral therapeutics development",
                    "Vaccine development and immunology"
                ],
                "research_description": "We focus on cutting-edge virology research, exploring virus-host interactions, immune responses, and developing innovative therapeutic approaches.",
                "education_description": "Training the next generation of researchers and healthcare professionals in immunology and virology."
            },
            meta_description="Dr. Valerie Odon's Virology Research Lab at the University of Strathclyde - Advancing immunology and virus research",
            meta_keywords="virology, immunology, research, University of Strathclyde, Dr. Valerie Odon",
            order=1
        ),
        PageContent(
            page_name="projects",
            title="Research Projects",
            subtitle="Exploring the frontiers of virology and immunology through innovative research initiatives",
            content={
                "collaborations_text": "We actively collaborate with leading research institutions, pharmaceutical companies, and healthcare organizations worldwide to advance our research goals and translate discoveries into clinical applications."
            },
            order=2
        ),
        PageContent(
            page_name="team",
            title="Our Team",
            subtitle="Meet the Researchers",
            content={
                "team_intro": "Our team comprises dedicated scientists, researchers, and students committed to advancing neuroscience."
            },
            is_published=True,
            order=3
        ),
        PageContent(
            page_name="contact",
            title="Contact Us",
            subtitle="Get in touch with the Odon Lab team",
            content={
                "contact_email": "valerie.odon@strath.ac.uk",
                "contact_phone": "+44 (0)141 548 2000",
                "address": "161 Cathedral Street, Glasgow G4 0RE, Scotland, UK",
                "institution": "University of Strathclyde",
                "department": "Strathclyde Institute of Pharmacy and Biomedical Sciences"
            },
            order=4
        ),
        PageContent(
            page_name="odonai",
            title="OdonAI",
            subtitle="Artificial Intelligence Applications in Virology and Immunology Research",
            content={
                "description": "OdonAI represents our commitment to integrating artificial intelligence and machine learning technologies into virology and immunology research. We leverage computational approaches to accelerate discovery and enhance our understanding of complex biological systems.",
                "background_image": "https://images.unsplash.com/photo-1655393001768-d946c97d6fd1?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDk1Nzd8MHwxfHNlYXJjaHwxfHxBSSUyMHRlY2hub2xvZ3l8ZW58MHx8fGJsdWV8MTc1MTYyMjk0NHww&ixlib=rb-4.1.0&q=85",
                "machine_learning_applications": [
                    "Viral sequence analysis and classification",
                    "Prediction of viral mutations and evolution",
                    "Drug target identification and optimization",
                    "Biomarker discovery for immune responses"
                ],
                "data_analytics": [
                    "High-throughput screening data analysis",
                    "Genomic and proteomic data integration",
                    "Clinical trial data modeling",
                    "Epidemiological pattern recognition"
                ]
            },
            order=5
        )
    ]
    
    for page in sample_pages:
        await db.pages.insert_one(page.dict())
    
    # Create sample projects
    sample_projects = [
        Project(
            title="Viral Pathogenesis Studies",
            description="Investigating the molecular mechanisms underlying viral infection and disease progression. Our research focuses on understanding how viruses interact with host cells and evade immune responses.",
            key_areas="Viral entry mechanisms, replication strategies, immune evasion, and pathogenesis pathways.",
            icon="🧬",
            order=1
        ),
        Project(
            title="Antiviral Drug Development",
            description="Developing novel therapeutic approaches to combat viral infections. We utilize cutting-edge techniques to identify and characterize potential antiviral compounds.",
            key_areas="Small molecule inhibitors, immunomodulatory agents, and combination therapies.",
            icon="🛡️",
            order=2
        ),
        Project(
            title="Vaccine Immunology",
            description="Studying immune responses to vaccines and developing improved vaccination strategies. Our work contributes to understanding vaccine efficacy and safety.",
            key_areas="Adjuvant development, immune memory formation, and vaccine delivery systems.",
            icon="💉",
            order=3
        ),
        Project(
            title="Host-Pathogen Interactions",
            description="Examining the complex interplay between viruses and their hosts at the cellular and molecular level. This research informs our understanding of disease susceptibility and resistance mechanisms.",
            key_areas="Advanced microscopy, proteomics, genomics, and systems biology approaches.",
            icon="🔬",
            order=4
        )
    ]
    
    for project in sample_projects:
        await db.projects.insert_one(project.dict())

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup_event():
    await init_default_admin()
    await init_sample_data()

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)