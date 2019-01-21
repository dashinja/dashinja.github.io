import React from 'react';
import ReactDOM from 'react-dom';
import ProjectCard from './components/portfolio/ProjectCard';

function App(props) {
  return <ProjectCard />;
}

ReactDOM.render(<App />, document.getElementById('special-root'));
