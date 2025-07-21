import React, { useState, useEffect } from 'react';
import PageLayout from './PageLayout';
import axios from 'axios';
import { API } from './App';

const TeamPage = () => {
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTeamMembers = async () => {
      try {
        const response = await axios.get(`${API}/team_members/published`);
        setTeamMembers(response.data);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchTeamMembers();
  }, []);

  if (loading) {
    return <PageLayout><div className="text-center py-20">Loading team members...</div></PageLayout>;
  }

  if (error) {
    return <PageLayout><div className="text-center py-20 text-red-500">Error loading team members: {error.message}</div></PageLayout>;
  }

  return (
    <PageLayout>
      <section className="pt-32 pb-20">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold text-slate-800 mb-6">
              Our Team
            </h1>
            <p className="text-xl text-slate-700 max-w-3xl mx-auto">
              Meet the dedicated individuals behind our success.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {teamMembers.map((member, index) => (
              <div key={index} className="bg-white rounded-lg shadow-lg p-8 text-center transform transition duration-300 hover:scale-105">
                <img
                  src={member.image}
                  alt={member.name}
                  className="w-32 h-32 rounded-full mx-auto mb-6 object-cover border-4 border-blue-500"
                />
                <h2 className="text-2xl font-semibold text-slate-800 mb-2">
                  {member.name}
                </h2>
                <p className="text-blue-600 text-lg font-medium mb-2">
                  {member.role}
                </p>
                <p className="text-slate-700 text-base">
                  {member.interests.join(', ')}
                </p>
                {member.bio && (
                  <p className="text-slate-600 text-sm mt-2">
                    {member.bio}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
    </PageLayout>
  );
};

export default TeamPage;