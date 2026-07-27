import { useState } from 'react';
import { useDraggable } from '@dnd-kit/core';

import type { BuilderComponentType } from '../../types/page';
import '../../styles/builder.css';
import {
  SearchIcon,
  TextIcon,
  ButtonIcon,
  InputIcon,
  TextareaIcon,
  SelectIcon,
  CheckboxIcon,
  RadioIcon,
  CardIcon,
  TableIcon,
  ImageIcon,
  DividerIcon
} from './ComponentSidebarIcons';

type SidebarComponentDefinition = {
  type: BuilderComponentType;
  label: string;
  Icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
};

const COMPONENT_DEFINITIONS: SidebarComponentDefinition[] = [
  { type: 'Text', label: 'Text', Icon: TextIcon },
  { type: 'Button', label: 'Button', Icon: ButtonIcon },
  { type: 'Input', label: 'Input', Icon: InputIcon },
  { type: 'Textarea', label: 'Textarea', Icon: TextareaIcon },
  { type: 'Image', label: 'Image', Icon: ImageIcon },
  { type: 'Divider', label: 'Divider', Icon: DividerIcon },
  { type: 'Select', label: 'Select', Icon: SelectIcon },
  { type: 'Checkbox', label: 'Checkbox', Icon: CheckboxIcon },
  { type: 'Radio', label: 'Radio', Icon: RadioIcon },
  { type: 'Card', label: 'Card', Icon: CardIcon },
  { type: 'Table', label: 'Table', Icon: TableIcon },
];

interface DraggableSidebarItemProps {
  definition: SidebarComponentDefinition;
  onClick: (type: BuilderComponentType) => void;
}

const DraggableSidebarItem = ({ definition, onClick }: DraggableSidebarItemProps) => {
  const { type, label, Icon } = definition;
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `sidebar-${type}`,
    data: {
      source: 'sidebar',
      componentType: type,
    },
  });

  return (
    <button
      type="button"
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={[
        "component-sidebar__item",
        isDragging ? "component-sidebar__item--dragging" : ""
      ].filter(Boolean).join(" ")}
      onClick={() => onClick(type)}
    >
      <Icon className="component-sidebar__item-icon" aria-hidden="true" focusable="false" />
      <span className="component-sidebar__item-label">{label}</span>
    </button>
  );
};

interface ComponentSidebarProps {
  onAddComponent: (type: BuilderComponentType) => void;
}

const ComponentSidebar = ({ onAddComponent }: ComponentSidebarProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  
  const normalizedQuery = searchQuery.trim().toLowerCase();
  const filteredComponents = COMPONENT_DEFINITIONS.filter((definition) =>
    definition.label.toLowerCase().includes(normalizedQuery)
  );

  return (
    <div className="builder-sidebar">
      <div className="component-sidebar__palette">
        <div className="component-sidebar__search">
          <SearchIcon className="component-sidebar__search-icon" aria-hidden="true" focusable="false" />
          <input
            className="component-sidebar__search-input"
            type="search"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.currentTarget.value)}
            placeholder="Rechercher un composant..."
            aria-label="Rechercher un composant"
          />
        </div>

        <div className="component-sidebar__list">
          {filteredComponents.length > 0 ? (
            filteredComponents.map((def) => (
              <DraggableSidebarItem
                key={def.type}
                definition={def}
                onClick={onAddComponent}
              />
            ))
          ) : (
            <p className="component-sidebar__empty">Aucun composant trouvé</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ComponentSidebar;

