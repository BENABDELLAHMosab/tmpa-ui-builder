import '../../styles/builder.css';

const components = ['Text', 'Button', 'Input', 'Card', 'Table'];

const ComponentSidebar = () => {
  const handleComponentClick = () => {
    alert("Drag and drop will be implemented in the next sprint.");
  };

  return (
    <div className="builder-sidebar">
      <h3>Components</h3>
      <div className="component-list">
        {components.map((comp) => (
          <button 
            key={comp} 
            className="component-item"
            onClick={handleComponentClick}
          >
            {comp}
          </button>
        ))}
      </div>
    </div>
  );
};

export default ComponentSidebar;
