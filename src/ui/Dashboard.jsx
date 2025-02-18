import "./Dashboard.css";
import Sidebar from "./Sidebar";
import MainApp from "./MainApp";
import { useState } from "react";
import MenuOpenOutlinedIcon from "@mui/icons-material/MenuOpenOutlined";
import CloseOutlinedIcon from "@mui/icons-material/CloseOutlined";
// import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';
function Dashboard() {
  const [isOpen, setIsOpen] = useState(true);
  return (
    <div className="dashboard">
      <div className={`sidebar ${isOpen ? "open" : "closed"}`}>
        <Sidebar />
      </div>
      <button className="toggle-btn" onClick={() => setIsOpen(!isOpen)}>
        {isOpen ? <CloseOutlinedIcon /> : <MenuOpenOutlinedIcon />}
      </button>
      <div className="mainApp">
        <MainApp />
      </div>
    </div>
  );
}

export default Dashboard;
