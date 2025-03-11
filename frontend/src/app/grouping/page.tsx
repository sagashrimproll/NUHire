'use client';
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import NavbarAdmin from "../components/navbar-admin";


const Grouping = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState([]);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [group_id, setGroupId] = useState("");
  const [groups, setGroups] = useState({});
  const router = useRouter();

  // ✅ Fetch the logged-in user
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch("http://localhost:5001/auth/user", { credentials: "include" });
        const userData = await response.json();

        if (response.ok) {
          setUser(userData);
        } else {
          setUser(null);
          router.push("/login");
        }
      } catch (error) {
        console.error("Error fetching user:", error);
        router.push("/login");
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
        const response = await fetch("http://localhost:5001/students");
        const data = await response.json();
        setStudents(data);
      } catch (error) {
        console.error("Error fetching students:", error);
      }
    };
    fetchStudents();
  }, []);

  // ✅ Handle student selection
  const handleStudentSelection = (event) => {
    const selectedEmail = event.target.value;
    const selectedStudent = students.find(student => student.email === selectedEmail);

    if (selectedStudent && !selectedStudents.some(student => student.email === selectedEmail)) {
      setSelectedStudents([...selectedStudents, selectedStudent]);
    }
  };

  // ✅ Handle removing a selected student
  const handleRemoveStudent = (email) => {
    setSelectedStudents(selectedStudents.filter(student => student.email !== email));
  };

  // ✅ Handle group assignment
  const handleAssignGroup = async () => {
    if (!group_id || selectedStudents.length === 0) {
      alert("Please enter a valid group ID and select at least one student.");
      return;
    }

    try {
      const response = await fetch("http://localhost:5001/update-group", {
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
      } else {
        alert("Failed to assign students to group.");
      }
    } catch (error) {
      console.error("Error updating group:", error);
    }
  };

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const response = await fetch("http://localhost:5001/groups");
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

    {/* Groups Display Section */}
    <div className="mt-6">
      {groups && Object.keys(groups).length > 0 ? (
        Object.entries(groups).map(([group_id, students]) => (
          <div key={group_id} className="bg-springWater p-4 rounded-md mb-4 shadow">
            <h3 className="text-xl font-semibold text-navy">Group {group_id} :</h3>
            <ul className="list-disc pl-5 text-navy mt-2">
              {Array.isArray(students) && students.length > 0 ? (
                students.map((student, index) => (
                  <li key={index}>
                    {student.name} ({student.email}) - {student.current_page}
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
