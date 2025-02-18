import "./Main.css";

function MainApp() {
  return (
    <div>
      <div className="user-header-content">
        <div className="user-header">
          <span class="material-symbols-outlined">download</span>
          <b>John Ben</b>
          <small>J</small>
        </div>
      </div>
      <div className="main_container">
        <div className="main-header">
          <h1>AI Lesson Note Generator</h1>
          <p>Create lesson note in seconds with lesnote.ai</p>
        </div>
        <div className="main_inputs">
          <div className="main-div-input">
            {" "}
            <label>Subject/Topic</label>{" "}
            <input type="text" placeholder="What is noun" />
          </div>
          <div className="main-div-input">
            {" "}
            <label>Class</label> <input type="text" placeholder="JSS1" />
          </div>
          <div className="main-div-input">
            {" "}
            <label>Duration</label>{" "}
            <input type="text" placeholder="5 minutes" />
          </div>
          <div className="main-div-input">
            {" "}
            <label>Learning Objectives</label> <textarea></textarea>
          </div>
          <button>Generate Lesson Note</button>
        </div>
      </div>
    </div>
  );
}

export default MainApp;
