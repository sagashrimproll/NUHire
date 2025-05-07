'use client';
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import NavbarAdmin from "../components/navbar-admin";

interface User {
  id: number;
  name: string;
  email: string;
  affiliation: string;
}

interface Job {
  id: number;
  title: string;
  file_path: string;
}

interface Resume {
  id: number;
  title: string;
  file_path: string;
}


const Upload = () => {
  const [user, setUser] = useState<User| null>(null);
  const [loading, setLoading] = useState(true);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState("");
  const [title, setTitle] = useState("");
  const [resTitle, setResTitle] = useState("");
  const [uploading, setUploading] = useState(false);
  const [selectedResume, setSelectedResume] = useState<number | null>(null);
  const router = useRouter();

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

  useEffect(() => {
    fetchJobs();
    fetchResumes();
  }, []);

  const fetchJobs = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/jobs`);
      const data = await response.json();
      setJobs(data);
    } catch (error) {
      console.error("Error fetching jobs:", error);
    }
  };

  const fetchResumes = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/resume_pdf`);
      const data = await response.json();
      setResumes(data);
    } catch (error) {
      console.error("Error fetching resumes:", error);
    }
  };

  const saveFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
      setFileName(e.target.files[0].name);
    }
  };

  const deleteResume = async (filePath: string) => {
    const fileName = filePath.split("/").pop(); // Extract just the filename
    
    try {
      const response = await fetch(`${API_BASE_URL}/delete/resume/${fileName}`, {
        method: "DELETE",
      });
  
      if (!response.ok) {
        throw new Error(`Error: ${await response.text()}`);
      }
      
      alert("Resume deleted successfully.");
  
      // Refresh the resumes list after deletion
      fetchResumes();
    } catch (error) {
      console.error("Failed to delete file:", error);
      alert("Failed to delete the file.");
    }
  };

  const deleteJob = async (filePath: string) => {
    const fileName = filePath.split("/").pop(); // Extract just the filename
    
    try {
      const response = await fetch(`${API_BASE_URL}/delete/job/${fileName}`, {
        method: "DELETE",
      });
  
      if (!response.ok) {
        throw new Error(`Error: ${await response.text()}`);
      }
      
      alert("job deleted successfully.");
      fetchJobs();
      // Refresh the resumes list after deletion
      fetchJobs();
    } catch (error) {
      console.error("Failed to delete file:", error);
      alert("Failed to delete the file.");
    }
  };

  const uploadFile = async (type: "job" | "resume") => {
    if (!file) return alert("Please select a file before uploading.");
  
    const formData = new FormData();
    formData.append(type === "job" ? "jobDescription" : "resume", file);
  
    try {
      setUploading(true);

  
      const response = await fetch(`${API_BASE_URL}/upload/${type}`, { 
        method: "POST", 
        body: formData 
      });
  
      if (!response.ok) throw new Error("File upload failed");
      const { filePath } = await response.json();
  
      if (type === "job") {
        await fetch(`${API_BASE_URL}/jobs`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title, filePath }),
        });
        fetchJobs();
      } else if (type === "resume") {
        await fetch(`${API_BASE_URL}/resume_pdf`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ resTitle, filePath }),
        });
        fetchResumes();
      }
    } catch (error) {
      console.error("Upload error:", error);
    } finally {
      setUploading(false);
    }
  };  

const handleResumeSelection = (id: number) => {
  console.log("Selected Resume ID:", id); // Debugging log
  setSelectedResume(id);
};


  if (loading) return <div>Loading...</div>;
  if (!user || user.affiliation !== "admin") return <div>Unauthorized</div>;

  return (
    <div className="flex flex-col min-h-screen bg-sand font-rubik">
      <NavbarAdmin />
      <div className="grid grid-cols-2 gap-4 p-4">
        <div>
          <h2 className="text-2xl font-bold text-navy">Upload Job Description</h2>
          <input type="text" placeholder="Enter job title" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full p-2 border rounded mt-2" />
          <input type="file" accept="application/pdf" onChange={saveFile} className="w-full p-2 border rounded mt-2" />
          <button onClick={() => uploadFile("job")} disabled={uploading} className="w-full bg-wood text-navy p-2 rounded mt-2">
            {uploading ? "Uploading..." : "Upload"}
          </button>
          <h3 className="text-xl font-bold mt-4">Existing Job Descriptions</h3>
          <ul>
            {jobs.length === 0 ? <p>No job descriptions uploaded yet.</p> : jobs.map((job) => (
              <li key={job.id} className="border-b py-2">
                <strong>{job.title}</strong> - <a href={`${API_BASE_URL}/${job.file_path}`} target="_blank" className="text-blue-500">View PDF</a>
                <div className="flex gap-2">
          <button 
            onClick={() => deleteJob(job.file_path)} 
            className="p-1 bg-red-500 text-white rounded">
            Delete
          </button>
        </div>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h2 className="text-2xl font-bold text-navy">Upload Resume</h2>
          <input type="text" placeholder="Enter resume title" value={resTitle} onChange={(e) => setResTitle(e.target.value)} className="w-full p-2 border rounded mt-2" />
          <input type="file" accept="application/pdf" onChange={saveFile} className="w-full p-2 border rounded mt-2" />
          <button onClick={() => uploadFile("resume")} disabled={uploading} className="w-full bg-navy text-white p-2 rounded mt-2">
            {uploading ? "Uploading..." : "Upload"}
          </button>
          <h3 className="text-xl font-bold mt-4">Existing Resumes</h3>
<ul>
  {resumes.length === 0 ? (
    <p>No resumes uploaded yet.</p>
  ) : (
    resumes.map((resume) => (
      <li key={resume.id} className="border-b py-2 flex justify-between items-center">
        <div>
          <strong>{resume.title}</strong> - 
          <a href={`${API_BASE_URL}/${resume.file_path}`} target="_blank" className="text-blue-500 ml-2">View</a>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => deleteResume(resume.file_path)} 
            className="p-1 bg-red-500 text-white rounded">
            Delete
          </button>
        </div>
      </li>
    ))
  )}
</ul>


        </div>
      </div>
    </div>
  );
};

export default Upload;