// app/dashboard/components/team/TeamManagement.tsx
"use client";

import { useState, useEffect } from "react";
import { Theme, User, Team, TeamMember } from "../../types";
import { Users, UserPlus, Trash, ShieldAlert, Shield, Plus, X } from "lucide-react";

interface TeamManagementProps {
  theme: Theme;
  user: User | null;
}

export default function TeamManagement({ theme, user }: TeamManagementProps) {
  // States
  const [teams, setTeams] = useState<Team[]>([]);
  const [activeTeam, setActiveTeam] = useState<number | null>(null);
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showCreateTeamModal, setShowCreateTeamModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('member');
  const [newTeamName, setNewTeamName] = useState('');

  // Mock fetch teams (replace with actual API call)
  useEffect(() => {
    // Simulate fetching teams
    const fetchTeams = () => {
      try {
        // For demo purposes
        setTimeout(() => {
          // Sample teams data
          const mockTeams: Team[] = [
            { id: 1, name: "Engineering" },
            { id: 2, name: "Marketing" },
            { id: 3, name: "Sales" }
          ];

          setTeams(mockTeams);

          if (mockTeams.length > 0) {
            setActiveTeam(mockTeams[0].id);
          }

          setLoading(false);
        }, 1000);
      } catch (err) {
        console.error("Error fetching teams:", err);
        setError("Failed to load teams. Please try again.");
        setLoading(false);
      }
    };

    // Only fetch teams for business accounts
    if (user && user.accountType === 'business') {
      fetchTeams();
    } else {
      setLoading(false);
    }
  }, [user]);

  // Mock fetch team members when active team changes
  useEffect(() => {
    if (!activeTeam) return;

    // Simulate fetching team members
    const fetchMembers = () => {
      try {
        // For demo purposes
        setTimeout(() => {
          // Sample members data
          const mockMembers: TeamMember[] = [
            {
              id: 1,
              userId: user?.id || 1,
              teamId: activeTeam,
              role: "owner",
              user: {
                id: user?.id || 1,
                fullName: user?.fullName || "Current User",
                email: user?.email || "user@example.com"
              }
            },
            {
              id: 2,
              userId: 2,
              teamId: activeTeam,
              role: "admin",
              user: {
                id: 2,
                fullName: "Jane Smith",
                email: "jane@example.com"
              }
            },
            {
              id: 3,
              userId: 3,
              teamId: activeTeam,
              role: "member",
              user: {
                id: 3,
                fullName: "Alex Johnson",
                email: "alex@example.com"
              }
            }
          ];

          setMembers(mockMembers);
        }, 800);
      } catch (err) {
        console.error(`Error fetching members for team ${activeTeam}:`, err);
        setError("Failed to load team members. Please try again.");
      }
    };

    fetchMembers();
  }, [activeTeam, user]);

  // Handle team creation
  const handleCreateTeam = (e: React.FormEvent) => {
    e.preventDefault();

    if (!newTeamName.trim()) {
      setError("Team name is required");
      return;
    }

    // Create new team
    const newId = teams.length > 0 ? Math.max(...teams.map(t => t.id)) + 1 : 1;
    const newTeam: Team = {
      id: newId,
      name: newTeamName,
      createdAt: new Date().toISOString() // Assuming createdAt is needed
    };

    // Update teams state
    setTeams([...teams, newTeam]);
    setActiveTeam(newId);

    // Create owner member for this team
    if (user) {
      const ownerMember: TeamMember = {
        id: 1, // Assuming a unique ID for the member within the team context or a global ID
        userId: user.id || 1,
        teamId: newId,
        role: "owner",
        user: {
          id: user.id || 1,
          fullName: user.fullName,
          email: user.email
        }
      };

      setMembers([ownerMember]);
    }

    // Reset form and close modal
    setNewTeamName('');
    setShowCreateTeamModal(false);
  };

  // Handle member invitation
  const handleInviteMember = (e: React.FormEvent) => {
    e.preventDefault();

    if (!inviteEmail.trim()) {
      setError("Email is required");
      return;
    }

    // Check if email is valid
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(inviteEmail)) {
      setError("Please enter a valid email address");
      return;
    }

    // Create new member
    const newId = members.length > 0 ? Math.max(...members.map(m => m.id)) + 1 : 1;
    const newMember: TeamMember = {
      id: newId,
      userId: newId + 10, // Fake ID
      teamId: activeTeam!,
      role: inviteRole,
      user: {
        id: newId + 10,
        fullName: inviteEmail.split('@')[0], // Use email username as full name for demo
        email: inviteEmail
      }
    };

    // Update members state
    setMembers([...members, newMember]);

    // Reset form and close modal
    setInviteEmail('');
    setInviteRole('member');
    setShowInviteModal(false);
  };

  // Handle member removal
  const handleRemoveMember = (memberId: number) => {
    // Update members state
    setMembers(members.filter(member => member.id !== memberId));
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  // Personal account case
  if (!user || user.accountType !== 'business') {
    return (
      <div className={`p-6 rounded-2xl ${theme === "dark" ? "bg-[#13131f] border-[#2a2a3c]" : "bg-white border-gray-200"} border shadow-sm`}>
        <div className="text-center py-12">
          <div className={`h-16 w-16 mx-auto rounded-full ${theme === "dark" ? "bg-[#1a1a2c]" : "bg-gray-100"} flex items-center justify-center mb-4`}>
            <Users className={`h-8 w-8 ${theme === "dark" ? "text-purple-400" : "text-purple-500"}`} />
          </div>
          <h2 className={`text-xl font-semibold mb-2 ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
            Team Management
          </h2>
          <p className={`max-w-md mx-auto ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
            Team management is only available for business accounts. Upgrade to a business plan to invite team members and collaborate.
          </p>
          <button className="mt-6 px-5 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-medium rounded-xl">
            Upgrade to Business
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`rounded-2xl ${theme === "dark" ? "bg-[#13131f] border-[#2a2a3c]" : "bg-white border-gray-200"} border shadow-sm overflow-hidden`}>
      <div className="p-6 border-b border-[#2a2a3c]">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
          <h2 className={`text-xl font-semibold mb-4 md:mb-0 ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
            Team Management
          </h2>

          <div className="flex flex-wrap gap-2">
            {teams.length > 0 && (
              <select
                className={`rounded-lg text-sm ${
                  theme === "dark"
                    ? "bg-[#1a1a2c] border-[#2a2a3c] text-white"
                    : "bg-gray-50 border-gray-200 text-gray-900"
                } border p-2`}
                value={activeTeam || ''}
                onChange={(e) => setActiveTeam(parseInt(e.target.value))}
              >
                {teams.map((team) => (
                  <option key={team.id} value={team.id}>
                    {team.name}
                  </option>
                ))}
              </select>
            )}

            <button
              className="px-4 py-2 rounded-lg text-sm font-medium border transition-colors bg-purple-600/10 text-purple-500 border-purple-600/20 hover:bg-purple-600/20"
              onClick={() => setShowCreateTeamModal(true)}
            >
              <span className="hidden md:inline">New Team</span>
              <Plus className="md:hidden h-4 w-4" />
            </button>

            {activeTeam && (
              <button
                className="px-4 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 text-white text-sm font-medium flex items-center"
                onClick={() => setShowInviteModal(true)}
              >
                <UserPlus className="h-4 w-4 mr-2" />
                <span>Invite</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className={`px-6 py-3 ${theme === "dark" ? "bg-red-900/20 text-red-400" : "bg-red-50 text-red-600"} border-b border-[#2a2a3c]`}>
          <p>{error}</p>
          <button
            className="underline text-sm ml-2"
            onClick={() => setError(null)}
          >
            Dismiss
          </button>
        </div>
      )}

      {/* No teams case */}
      {teams.length === 0 ? (
        <div className="p-8 text-center">
          <div className={`h-16 w-16 mx-auto rounded-full ${theme === "dark" ? "bg-[#1a1a2c]" : "bg-gray-100"} flex items-center justify-center mb-4`}>
            <Users className={`h-8 w-8 ${theme === "dark" ? "text-purple-400" : "text-purple-500"}`} />
          </div>
          <p className={`mb-4 ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
            You haven't created any teams yet.
          </p>
          <button
            className="px-5 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-medium rounded-lg"
            onClick={() => setShowCreateTeamModal(true)}
          >
            Create Your First Team
          </button>
        </div>
      ) : !activeTeam ? (
        <div className="p-8 text-center">
          <p className={`mb-4 ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
            Please select a team to manage.
          </p>
        </div>
      ) : members.length === 0 ? (
        <div className="p-8 text-center">
          <p className={`mb-4 ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
            This team has no members yet.
          </p>
          <button
            className="px-5 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-medium rounded-lg"
            onClick={() => setShowInviteModal(true)}
          >
            Invite Team Members
          </button>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className={`border-b ${theme === "dark" ? "border-[#2a2a3c]" : "border-gray-200"}`}>
                <th className={`text-left px-6 py-3 font-medium ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                  Name
                </th>
                <th className={`text-left px-6 py-3 font-medium ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                  Email
                </th>
                <th className={`text-left px-6 py-3 font-medium ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                  Role
                </th>
                <th className={`text-right px-6 py-3 font-medium ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {members.map((member) => (
                <tr key={member.id} className={`border-b ${theme === "dark" ? "border-[#2a2a3c]" : "border-gray-200"}`}>
                  <td className={`px-6 py-4 ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
                    {member.user?.fullName || 'Unknown'}
                  </td>
                  <td className={`px-6 py-4 ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                    {member.user?.email || 'Unknown'}
                  </td>
                  <td className={`px-6 py-4`}>
                    <span className={`inline-flex items-center px-2 py-1 text-xs rounded-full ${
                      member.role === 'owner'
                        ? theme === "dark" ? "bg-purple-500/20 text-purple-400" : "bg-purple-100 text-purple-700"
                        : member.role === 'admin'
                          ? theme === "dark" ? "bg-blue-500/20 text-blue-400" : "bg-blue-100 text-blue-700"
                          : theme === "dark" ? "bg-gray-500/20 text-gray-400" : "bg-gray-100 text-gray-700"
                    }`}>
                      {member.role === 'owner' && <ShieldAlert className="h-3 w-3 mr-1" />}
                      {member.role === 'admin' && <Shield className="h-3 w-3 mr-1" />}
                      {member.role.charAt(0).toUpperCase() + member.role.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    {/* Can't remove yourself (owner) */}
                    {member.user?.id !== user.id && (
                      <button
                        className={`p-2 rounded-lg ${theme === "dark" ? "text-red-400 hover:bg-red-900/20" : "text-red-600 hover:bg-red-100"}`}
                        title="Remove from team"
                        onClick={() => handleRemoveMember(member.id)}
                      >
                        <Trash className="h-4 w-4" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create Team Modal */}
      {showCreateTeamModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div
            className={`max-w-md w-full m-4 rounded-xl ${theme === "dark" ? "bg-[#13131f] border-[#2a2a3c]" : "bg-white border-gray-200"} border shadow-xl`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className={`text-lg font-semibold ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
                  Create New Team
                </h3>
                <button
                  onClick={() => setShowCreateTeamModal(false)}
                  className={`p-1 rounded hover:bg-opacity-10 ${theme === "dark" ? "hover:bg-gray-300" : "hover:bg-gray-700"}`}
                >
                  <X className={`h-5 w-5 ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`} />
                </button>
              </div>

              <form onSubmit={handleCreateTeam}>
                <div className="mb-6">
                  <label
                    htmlFor="teamName"
                    className={`block text-sm font-medium mb-2 ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}
                  >
                    Team Name
                  </label>
                  <input
                    id="teamName"
                    type="text"
                    required
                    value={newTeamName}
                    onChange={(e) => setNewTeamName(e.target.value)}
                    className={`w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 ${
                      theme === "dark"
                        ? "bg-[#1a1a2c] border-[#2a2a3c] text-white"
                        : "bg-gray-50 border-gray-200 text-gray-900"
                    } border`}
                    placeholder="Marketing, Engineering, etc."
                  />
                </div>

                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowCreateTeamModal(false)}
                    className={`px-4 py-2 rounded-lg ${
                      theme === "dark" ? "bg-[#1a1a2c] text-gray-300" : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    Cancel
                  </button>
                  <button
                  type="submit"
                  className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg text-white"
                >
                  Create Team
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    )}

    {/* Invite Member Modal */}
    {showInviteModal && (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div
          className={`max-w-md w-full m-4 rounded-xl ${theme === "dark" ? "bg-[#13131f] border-[#2a2a3c]" : "bg-white border-gray-200"} border shadow-xl`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className={`text-lg font-semibold ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
                Invite Team Member
              </h3>
              <button
                onClick={() => setShowInviteModal(false)}
                className={`p-1 rounded hover:bg-opacity-10 ${theme === "dark" ? "hover:bg-gray-300" : "hover:bg-gray-700"}`}
              >
                <X className={`h-5 w-5 ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`} />
              </button>
            </div>

            <form onSubmit={handleInviteMember}>
              <div className="space-y-4 mb-6">
                <div>
                  <label
                    htmlFor="memberEmail"
                    className={`block text-sm font-medium mb-2 ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}
                  >
                    Email Address
                  </label>
                  <input
                    id="memberEmail"
                    type="email"
                    required
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    className={`w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 ${
                      theme === "dark"
                        ? "bg-[#1a1a2c] border-[#2a2a3c] text-white"
                        : "bg-gray-50 border-gray-200 text-gray-900"
                    } border`}
                    placeholder="colleague@example.com"
                  />
                </div>

                <div>
                  <label
                    htmlFor="memberRole"
                    className={`block text-sm font-medium mb-2 ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}
                  >
                    Role
                  </label>
                  <select
                    id="memberRole"
                    value={inviteRole}
                    onChange={(e) => setInviteRole(e.target.value)}
                    className={`w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 ${
                      theme === "dark"
                        ? "bg-[#1a1a2c] border-[#2a2a3c] text-white"
                        : "bg-gray-50 border-gray-200 text-gray-900"
                    } border`}
                  >
                    <option value="member">Member</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowInviteModal(false)}
                  className={`px-4 py-2 rounded-lg ${
                    theme === "dark" ? "bg-[#1a1a2c] text-gray-300" : "bg-gray-100 text-gray-700"
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg text-white"
                >
                  Send Invite
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    )}
  </div>
);
}