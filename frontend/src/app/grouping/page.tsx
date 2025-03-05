'use client';
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import NavbarAdmin from "../components/navbar-admin";
import "../styles/grouping.css";


const Grouping = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState([]);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [groupId, setGroupId] = useState("");
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
    if (!groupId || selectedStudents.length === 0) {
      alert("Please enter a valid group ID and select at least one student.");
      return;
    }

    try {
      const response = await fetch("http://localhost:5001/update-group", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          groupId,
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
    <div >
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link href="https://fonts.googleapis.com/css2?family=Poiret+One&family=Roboto:ital,wght@0,100..900;1,100..900&display=swap" rel="stylesheet" />
      <NavbarAdmin />
    <div className="body">
      <h1 className="header">Group Management</h1>

      {/* Group ID Input */}
      <input 
        type="text" 
        placeholder="Enter Group ID" 
        value={groupId}
        onChange={(e) => setGroupId(e.target.value)}
        className="groupinput"
      />

      {/* Student Selection */}
      <select onChange={handleStudentSelection} className="studentselect">
        <option value="">Select a student</option>
        {students.map(student => (
          <option key={student.email} value={student.email}>
            {student.f_name} {student.l_name} ({student.email})
          </option>
        ))}
      </select>

      {/* Selected Students List */}
      <div className="selectedlist">
        {selectedStudents.map(student => (
          <div key={student.email} className="selectedstudent">
            <span>{student.f_name} {student.l_name} ({student.email})</span>
            <button onClick={() => handleRemoveStudent(student.email)} className="removebutton">
              Remove
            </button>
          </div>
        ))}
      </div>

      {/* Assign Group Button */}
      <button 
        onClick={handleAssignGroup} 
        className="assignbutton">
        Assign Group
      </button>

      {/* Groups Display Section */}
      {groups && Object.keys(groups).length > 0 ? (
        Object.entries(groups).map(([groupId, students]) => (
          <div key={groupId} className="group">
            <h3 className="groupnum">Group {groupId} :</h3>
            <ul className="studentsingroup">
              {Array.isArray(students) && students.length > 0 ? (
                students.map((student, index) => (
                  <li key={index}>
                    {student.name} ({student.email})
                  </li>
                ))
              ) : (
                <li>No students assigned</li>
              )}  
            </ul>
          </div>
        ))
      ) : (
        <p>No groups assigned yet.</p>
      )}
    </div>
    </div>
  );
};

export default Grouping;
