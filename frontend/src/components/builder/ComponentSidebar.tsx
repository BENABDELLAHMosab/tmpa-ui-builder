import { useDraggable } from '@dnd-kit/core';

import type { BuilderComponentType } from '../../types/page';
import '../../styles/builder.css';

const components: BuilderComponentType[] = ['Text', 'Button', 'Input', 'Card', 'Table'];

interface DraggableSidebarItemProps {
  type: BuilderComponentType;
  onClick: (type: BuilderComponentType) => void;
}

const DraggableSidebarItem = ({ type, onClick }: DraggableSidebarItemProps) => {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `sidebar-${type}`,
    data: {
      source: 'sidebar',
      componentType: type,
    },
  });

  return (
    <button
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={`component-item ${isDragging ? 'is-dragging' : ''}`}
      onClick={() => onClick(type)}
    >
      {type}
    </button>
  );
};

interface ComponentSidebarProps {
  onAddComponent: (type: BuilderComponentType) => void;
}

const ComponentSidebar = ({ onAddComponent }: ComponentSidebarProps) => {
  return (
    <div className="builder-sidebar">
      <h3>Components</h3>
      <div className="component-list">
        {components.map((comp) => (
          <DraggableSidebarItem
            key={comp}
            type={comp}
            onClick={onAddComponent}
          />
        ))}
      </div>
    </div>
  );
};

export default ComponentSidebar;
