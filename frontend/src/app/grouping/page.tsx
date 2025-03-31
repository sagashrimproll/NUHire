'use client';
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import NavbarAdmin from "../components/navbar-admin";


const Grouping = () => {
  const [user, setUser] = useState<{ affiliation: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState<{ email: string; f_name: string; l_name: string }[]>([]);
  const [selectedStudents, setSelectedStudents] = useState<{ email: string; f_name: string; l_name: string }[]>([]);
  const [group_id, setGroupId] = useState("");
  const [job_group_id, setGroupIdJob] = useState("");    
  const [groups, setGroups] = useState({});
  const router = useRouter();

  // ✅ Fetch the logged-in user
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/auth/user`, { credentials: "include" });
        const userData = await response.json();

        if (response.ok) {
          setUser(userData);
        } else {
          setUser(null);
          router.push("/");
        }
      } catch (error) {
        console.error("Error fetching user:", error);
        router.push("/");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [router]);

  // ✅ Fetch students from the database
  useEffect(() => {
    const fetchStudents = async () => {
      try { 
        const response = await fetch(`${API_BASE_URL}/students`);
        const data = await response.json();
        setStudents(data);
      } catch (error) {
        console.error("Error fetching students:", error);
      }
    };
    fetchStudents();
  }, []);

  // ✅ Handle student selection
  const handleStudentSelection = (event: { target: { value: any; }; }) => {
    const selectedEmail = event.target.value;
    const selectedStudent = students.find(student => student.email === selectedEmail);

    if (selectedStudent && !selectedStudents.some(student => student.email === selectedEmail)) {
      setSelectedStudents([...selectedStudents, selectedStudent]);
    }
  };

  // ✅ Handle removing a selected student
  const handleRemoveStudent = (email : string) => {
    setSelectedStudents(selectedStudents.filter(student => student.email !== email));
  };

  useEffect(() => {
    const fetchJobs = async () => {
      try { 
        const response = await fetch(`${API_BASE_URL}/jobs`);
        const data = await response.json();
        setJobs(data);
      } catch (error) {
        console.error("Error fetching jobs:", error);
      }
    };
    fetchJobs();
  }, []);

  // ✅ Handle student selection
  const handleJobSelection = (event) => {
    const selectedTitle = event.target.value;
    const selectedJob = jobs.find(job => job.title === selectedTitle);

    if (selectedJob && !selectedJobs.some(job => job.title === selectedTitle)) {
      setSelectedJobs([selectedJob]);
    }
  };

  // ✅ Handle removing a selected student
  const handleRemoveJob = (title) => {
    setSelectedJobs(selectedJobs.filter(job => job.title !== title));
  };

  // ✅ Handle group assignment
  const handleAssignGroup = async () => {
    if (!group_id || selectedStudents.length === 0) {
      alert("Please enter a valid group ID and select at least one student.");
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/update-group`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          group_id,
          students: selectedStudents.map(student => student.email)
        }),
      });

      if (response.ok) {
        alert("Students assigned to group successfully!");
        setSelectedStudents([]);
        setGroupId("");
        window.location.reload();
      } else {
        alert("Failed to assign students to group.");
      }
    } catch (error) {
      console.error("Error updating group:", error);
    }
  };

  // ✅ Handle group assignment
  const handleAssignJob = async () => {
    if (!job_group_id || selectedJobs.length === 0) {
      alert("Please enter a valid group ID and select a Job.");
    }

    try {
      const response = await fetch(`${API_BASE_URL}/update-job`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          job_group_id,
          job: selectedJobs.map(job => job.title)
        }),
      });

      if (response.ok) {
        alert("job assigned to group successfully!");
        setSelectedJobs([]);
        setGroupIdJob("");
        window.location.reload();
      } else {
        alert("Failed to assign job to group.");
      }
    } catch (error) {
      console.error("Error updating group:", error);
    }
  };

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/groups`);
        const data = await response.json();
        setGroups(data);
      } catch (error) {
        console.error("Error fetching groups:", error);
      }
    };
  
    fetchGroups();
  }, []);
  

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user || user.affiliation !== "admin") {
    return <div>This account is not authorized for this page</div>;
  }

  return (
    <div className="flex flex-col min-h-screen bg-sand font-rubik">
  <NavbarAdmin />
  
  <div className="max-w-3xl mx-auto bg-navy justify-center items-center shadow-md rounded-lg p-6 mt-6">
    <h1 className="text-3xl font-bold text-center text-sand mb-6">Group Management</h1>

    {/* Group ID Input */}
    <input 
      type="text" 
      placeholder="Enter Group ID" 
      value={group_id}
      onChange={(e) => setGroupId(e.target.value)}
      className="w-full p-3 border border-wood bg-springWater rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
    />

    {/* Student Selection */}
    <select 
      onChange={handleStudentSelection} 
      className="w-full mt-4 p-3 border border-wood bg-springWater rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
    >
      <option value="">Select a student</option>
      {students.map(student => (
        <option key={student.email} value={student.email}>
          {student.f_name} {student.l_name} ({student.email})
        </option>
      ))}
    </select>

    {/* Selected Students List */}
    <div className="mt-4 space-y-2">
      {selectedStudents.map(student => (
        <div key={student.email} className="flex items-center justify-between p-3 bg-springWater rounded-md">
          <span className="text-navy">{student.f_name} {student.l_name} ({student.email})</span>
          <button 
            onClick={() => handleRemoveStudent(student.email)} 
            className="bg-red-500 text-white px-3 py-1 rounded-md hover:bg-red-600 transition"
          >
            Remove
          </button>
        </div>
      ))}
    </div>

    {/* Assign Group Button */}
    <button 
      onClick={handleAssignGroup} 
      className="w-full mt-4 bg-sand border-4 border-wood text-navy font-bold py-3 rounded-md hover:bg-blue-600 transition"
    >
      Assign Group
    </button>

    {/* Group ID Input */}
    <input 
      type="text" 
      placeholder="Enter Group ID" 
      value={job_group_id}
      onChange={(e) => setGroupIdJob(e.target.value)}
      className="w-full p-3 mt-4 border border-wood bg-springWater rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
    />

    {/* Job Selection */}
    <select 
      onChange={handleJobSelection} 
      className="w-full mt-4 p-3 border border-wood bg-springWater rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
    >
      <option value="">Select a job</option>
      {jobs.map(job => (
        <option key={job.title} value={job.title}>
          ({job.title})
        </option>
      ))}
    </select>

    {/* Selected Jobs List */}
    <div className="mt-4 space-y-2">
      {selectedJobs.map(job => (
        <div key={job.title} className="flex items-center justify-between p-3 bg-springWater rounded-md">
          <span className="text-navy">({job.title})</span>
          <button 
            onClick={() => handleRemoveJob(job.title)} 
            className="bg-red-500 text-white px-3 py-1 rounded-md hover:bg-red-600 transition"
          >
            Remove
          </button>
        </div>
      ))}
    </div>

    {/* Assign Job Button */}
    <button 
      onClick={handleAssignJob} 
      className="w-full mt-4 bg-sand border-4 border-wood text-navy font-bold py-3 rounded-md hover:bg-blue-600 transition"
    >
      Assign Job
    </button>

    {/* Groups Display Section */}
    <div className="mt-6">
      {groups && Object.keys(groups).length > 0 ? (
        Object.entries(groups).map(([group_id, students]) => (
          <div key={group_id} className="bg-springWater p-4 rounded-md mb-4 shadow">
            <h3 className="text-xl font-semibold text-navy">Group {group_id} : </h3>
            <ul className="list-disc pl-5 text-navy mt-2">
              {Array.isArray(students) && students.length > 0 ? (
                students.map((student, index) => (
                  <li key={index}>
                    {student.name} ({student.email}) - {student.current_page} - {student.job_des}
                  </li>
                ))
              ) : (
                <li>No students assigned</li>
              )}
            </ul>
          </div>
        ))
      ) : (
        <p className="text-gray-600 text-center">No groups assigned yet.</p>
      )}
    </div>
  </div>
</div>

  );
};

export default Grouping;