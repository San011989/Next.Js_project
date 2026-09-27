function Project() {
  return (
    <div className="page">
      <h1>My Projects</h1>

      <div className="project">
        <h2>1. Smart Attendance System</h2>
        <p>
          A face-recognition based attendance system developed using
          Python, OpenCV, SQLite, and Streamlit.
        </p>
      </div>

      <div className="project">
        <h2>2. Dog Breed Classifier</h2>
        <p>
          A machine learning application that identifies dog breeds
          from uploaded images using a CNN model.
        </p>
      </div>

      <div className="project">
        <h2>3. Plant Disease Detection</h2>
        <p>
          An AI-based application that detects diseases in corn leaves
          using image classification and deep learning.
        </p>
      </div>

      <div className="project">
        <h2>4. Employee Tracker</h2>
        <p>
          A web-based application for managing and tracking employee
          information using modern web technologies.
        </p>
      </div>
    </div>
  );
}

export default Project;