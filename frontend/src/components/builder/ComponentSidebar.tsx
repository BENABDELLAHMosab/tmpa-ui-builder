import { useState } from 'react';
import { useDraggable } from '@dnd-kit/core';
import type { BuilderComponentType } from '../../types/page';
import type { CustomComponentSummary } from '../../types/customComponent';
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
  DividerIcon,
  ContainerIcon
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
  { type: 'Container', label: 'Container', Icon: ContainerIcon },
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

interface DraggableCustomComponentProps {
  customComponent: CustomComponentSummary;
  onEditClick: (id: string, name: string, description: string) => void;
  onDeleteClick: (id: string, name: string) => void;
}

const DraggableCustomComponent = ({ customComponent, onEditClick, onDeleteClick }: DraggableCustomComponentProps) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `sidebar-custom-${customComponent.id}`,
    data: {
      source: "custom-component",
      customComponentId: customComponent.id,
      name: customComponent.name,
      rootType: customComponent.rootType,
      rootWidth: customComponent.rootWidth,
      rootHeight: customComponent.rootHeight
    },
  });

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={[
        "component-sidebar__item",
        isDragging ? "component-sidebar__item--dragging" : ""
      ].filter(Boolean).join(" ")}
      style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', padding: '8px 12px', gap: '4px', cursor: isDragging ? 'grabbing' : 'grab', position: 'relative' }}
      onMouseLeave={() => setMenuOpen(false)}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
        <span className="component-sidebar__item-label" style={{ fontWeight: 600 }}>{customComponent.name}</span>
        <div style={{ position: 'relative' }}>
          <button
            type="button"
            className="component-sidebar__action-btn"
            aria-label="Actions"
            aria-haspopup="true"
            onPointerDown={(e) => {
              e.stopPropagation();
            }}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setMenuOpen(!menuOpen);
            }}
          >
            ⋮
          </button>
          {menuOpen && (
            <div 
              className="component-sidebar__action-menu"
              onPointerDown={(e) => e.stopPropagation()}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                className="component-sidebar__action-menu-item"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setMenuOpen(false);
                  onEditClick(customComponent.id, customComponent.name, customComponent.description || "");
                }}
              >
                Edit
              </button>
              <button
                type="button"
                className="component-sidebar__action-menu-item component-sidebar__action-menu-item--danger"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setMenuOpen(false);
                  onDeleteClick(customComponent.id, customComponent.name);
                }}
              >
                Delete
              </button>
            </div>
          )}
        </div>
      </div>
      {customComponent.description && (
        <span style={{ fontSize: '11px', color: '#64748b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', width: '100%' }}>
          {customComponent.description}
        </span>
      )}
    </div>
  );
};

interface ComponentSidebarProps {
  onAddComponent: (type: BuilderComponentType) => void;
  customComponents: CustomComponentSummary[];
  isLoadingCustomComponents: boolean;
  customComponentsError: string | null;
  onEditCustomComponent: (id: string, name: string, description: string) => void;
  onDeleteCustomComponent: (id: string, name: string) => void;
}

const ComponentSidebar = ({ 
  onAddComponent,
  customComponents,
  isLoadingCustomComponents,
  customComponentsError,
  onEditCustomComponent,
  onDeleteCustomComponent
}: ComponentSidebarProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  
  const normalizedQuery = searchQuery.trim().toLowerCase();
  const filteredComponents = COMPONENT_DEFINITIONS.filter((definition) =>
    definition.label.toLowerCase().includes(normalizedQuery)
  );

  return (
    <div className="builder-sidebar sidebar-scrollbar">
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

      <div className="component-sidebar__palette" style={{ marginTop: '16px', borderTop: '1px solid #e2e8f0', paddingTop: '16px' }}>
        <h4 style={{ margin: '0 0 12px 0', fontSize: '12px', textTransform: 'uppercase', color: '#64748b', fontWeight: 600, padding: '0 12px' }}>
          My Components
        </h4>
        
        <div className="component-sidebar__list">
          {isLoadingCustomComponents ? (
            <p className="component-sidebar__empty" style={{ fontSize: '13px', color: '#94a3b8' }}>Loading...</p>
          ) : customComponentsError ? (
            <p className="component-sidebar__empty" style={{ fontSize: '13px', color: '#ef4444' }}>{customComponentsError}</p>
          ) : customComponents.length === 0 ? (
            <p className="component-sidebar__empty" style={{ fontSize: '13px', color: '#94a3b8' }}>No custom components yet</p>
          ) : (
            customComponents.map((comp) => (
              <DraggableCustomComponent 
                key={comp.id} 
                customComponent={comp} 
                onEditClick={onEditCustomComponent}
                onDeleteClick={onDeleteCustomComponent}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default ComponentSidebar;

