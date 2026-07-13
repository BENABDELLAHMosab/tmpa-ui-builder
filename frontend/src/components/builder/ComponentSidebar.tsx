import type { BuilderComponentType } from '../../types/page';
import '../../styles/builder.css';

const components: BuilderComponentType[] = ['Text', 'Button', 'Input', 'Card', 'Table'];

interface ComponentSidebarProps {
  onAddComponent: (type: BuilderComponentType) => void;
}

const ComponentSidebar = ({ onAddComponent }: ComponentSidebarProps) => {
  return (
    <div className="builder-sidebar">
      <h3>Components</h3>
      <div className="component-list">
        {components.map((comp) => (
          <button 
            key={comp} 
            className="component-item"
            onClick={() => onAddComponent(comp)}
          >
            {comp}
          </button>
        ))}
      </div>
    </div>
  );
};

export default ComponentSidebar;
