import React from 'react';

function ProjectCard(props) {
  return (
    <div className="card bg-dark text-white rounded border border-success">
      <a
        href="https://dashinja.github.io/recipeciprocity/"
        target="_blank"
        className="text-white"
      >
        <img
          className="card-img"
          style={{height: 200, width: 200}}
          src="../../assets/images/recipeciprocity.png"
          alt="Recipeciprocity Hero Image"
        />
        <div className="card-img-overlay container p-1 d-flex d-column justify-content-center align-items-end">
          <div className="row bg-success w-100 text-center mb-2 py-2 rounded">
            <h5 className="card-title w-100 m-0 p-0 col rounded">
              Recipeciprocity
            </h5>
          </div>
        </div>
      </a>
    </div>
  );
}

export default ProjectCard;
