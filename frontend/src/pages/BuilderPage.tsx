import { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { pageService } from '../services/page.service';
import { customComponentService } from '../services/customComponent.service';
import type { UiPage, BuilderComponent, BuilderComponentType, BuilderComponentStyle, BuilderComponentLayout } from '../types/page';
import type { CustomComponentSummary } from '../types/customComponent';
import BuilderHeader from '../components/builder/BuilderHeader';
import ComponentSidebar from '../components/builder/ComponentSidebar';
import BuilderCanvas from '../components/builder/BuilderCanvas';
import PropertiesPanel from '../components/builder/PropertiesPanel';
import HistoryPanel from '../components/builder/HistoryPanel';
import ComponentRenderer from '../components/renderers/ComponentRenderer';
import SaveCustomComponentModal from '../components/builder/SaveCustomComponentModal';
import '../styles/builder.css';
import {
  DndContext,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  closestCenter,
  pointerWithin,
  DragOverlay
} from '@dnd-kit/core';
import type { DragEndEvent, DragStartEvent, DragOverEvent } from '@dnd-kit/core';
import { clamp, normalizeComponentsLayout, DEFAULT_LAYOUTS, CANVAS_WIDTH, CANVAS_HEIGHT, MIN_DIMENSIONS_BY_TYPE } from '../utils/canvas';
import { generateId } from '../utils/id';
import { TABLE_STYLE_DEFAULTS } from '../utils/table';
import { getHighestZIndex, normalizeComponentLayers } from '../utils/layers';
import { SELECT_STYLE_DEFAULTS } from '../utils/select';
import { CHECKBOX_STYLE_DEFAULTS } from '../utils/checkbox';
import { RADIO_STYLE_DEFAULTS } from '../utils/radio';
import { TEXTAREA_STYLE_DEFAULTS } from '../utils/textarea';
import { IMAGE_STYLE_DEFAULTS } from '../utils/image';
import { DIVIDER_STYLE_DEFAULTS } from '../utils/divider';
import { 
  CONTAINER_STYLE_DEFAULTS, 
  normalizeComponentParents, 
  getContainerInnerDimensions, 
  getDescendantIds,
  normalizeContainerChildrenLayout,
  getMaxCompatibleContainerBorderWidth,
  evaluateContainerDrop,
  isContainerDropData,
  isSidebarDragData,
  isCanvasDragData
} from '../utils/container';
import type { DragTargetState, ContainerDropActiveDescriptor } from '../utils/container';
import { instantiateCustomComponent } from '../utils/customComponent';
import { createPortal } from 'react-dom';

const createBuilderComponent = (type: BuilderComponentType, initialX?: number, initialY?: number, initialZIndex?: number, parentId: string | null = null): BuilderComponent => {
  const newId = `comp_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
  const defaultLayout = DEFAULT_LAYOUTS[type] ?? { width: 300, height: 60 };
  const layout = {
    x: initialX ?? 24,
    y: initialY ?? 24,
    width: defaultLayout.width,
    height: defaultLayout.height,
    ...(initialZIndex !== undefined ? { zIndex: initialZIndex } : {})
  };
  
  if (type === 'Text') {
    return {
      id: newId,
      type: "Text",
      parentId,
      props: { text: "New text" },
      style: {
        fontFamily: "Inter",
        fontStyle: "normal",
        fontSize: 16,
        color: "#334155",
        fontWeight: 400,
        textAlign: "left",
        backgroundColor: "#ffffff",
        padding: 12,
        borderRadius: 6
      },
      layout
    };
  }

  let defaultProps: Record<string, unknown> = {};
  let defaultStyle: BuilderComponentStyle | undefined = undefined;

  switch (type) {
    case 'Button': 
      defaultProps = { label: "Button" }; 
      defaultStyle = {
        fontFamily: "Inter",
        fontStyle: "normal",
        fontSize: 14,
        fontWeight: 600,
        textAlign: "center",
        color: "#ffffff",
        backgroundColor: "#1e3a66",
        borderColor: "#1e3a66",
        borderWidth: 1,
        borderRadius: 8
      };
      break;
    case 'Input':
      defaultProps = {
        label: "Label",
        placeholder: "Enter value",
        inputType: "text",
        required: false
      };
      defaultStyle = {
        fontFamily: "Inter",
        fontStyle: "normal",
        fontSize: 14,
        fontWeight: 400,
        textAlign: "left",
        color: "#0f172a",
        backgroundColor: "#ffffff",
        borderColor: "#cbd5e1",
        borderWidth: 1,
        borderRadius: 8,
        padding: 12
      };
      break;
    case 'Card':
      defaultProps = { title: "Card title", content: "Card content" };
      defaultStyle = {
        fontFamily: "Inter",
        fontStyle: "normal",
        fontSize: 14,
        fontWeight: 400,
        textAlign: "left",
        color: "#334155",
        backgroundColor: "#ffffff",
        borderColor: "#dbe3ef",
        borderWidth: 1,
        borderRadius: 12,
        padding: 20
      };
      break;
    case 'Table': {
      const col1Id = generateId("column");
      const col2Id = generateId("column");
      const col3Id = generateId("column");
      const rowId = generateId("row");
      
      defaultProps = {
        columns: [
          { id: col1Id, label: "Column 1" },
          { id: col2Id, label: "Column 2" },
          { id: col3Id, label: "Column 3" }
        ],
        rows: [
          {
            id: rowId,
            cells: {
              [col1Id]: "Value 1",
              [col2Id]: "Value 2",
              [col3Id]: "Value 3"
            }
          }
        ]
      };
      defaultStyle = { ...TABLE_STYLE_DEFAULTS };
      break;
    }
    case 'Select': {
      const options = [
        {
          id: generateId("option"),
          label: "Option 1",
          value: "option-1"
        },
        {
          id: generateId("option"),
          label: "Option 2",
          value: "option-2"
        }
      ];

      defaultProps = {
        label: "Status",
        placeholder: "Choose an option",
        required: false,
        options
      };
      defaultStyle = { ...SELECT_STYLE_DEFAULTS };
      break;
    }
    case 'Checkbox': {
      defaultProps = {
        label: "Checkbox label",
        name: "",
        value: "on",
        required: false,
        defaultChecked: false
      };
      defaultStyle = { ...CHECKBOX_STYLE_DEFAULTS };
      break;
    }
    case 'Radio': {
      defaultProps = {
        label: "Radio label",
        name: "",
        value: "on",
        required: false,
        defaultChecked: false
      };
      defaultStyle = { ...RADIO_STYLE_DEFAULTS };
      break;
    }
    case 'Textarea': {
      defaultProps = {
        label: "Description",
        name: "",
        placeholder: "Enter text",
        required: false,
        defaultValue: ""
      };
      defaultStyle = { ...TEXTAREA_STYLE_DEFAULTS };
      break;
    }
    case 'Image': {
      defaultProps = {
        src: "",
        alt: "Image"
      };
      defaultStyle = { ...IMAGE_STYLE_DEFAULTS };
      break;
    }
    case 'Divider': {
      defaultProps = {};
      defaultStyle = { ...DIVIDER_STYLE_DEFAULTS };
      break;
    }
    case 'Container': {
      defaultProps = {};
      defaultStyle = { ...CONTAINER_STYLE_DEFAULTS };
      break;
    }
  }

  return {
    id: newId,
    type,
    parentId,
    props: defaultProps,
    ...(defaultStyle ? { style: defaultStyle } : {}),
    layout
  };
};

const customCollisionDetection = (args: any) => {
  const pointerCollisions = pointerWithin(args);
  
  if (pointerCollisions.length > 0) {
    const activeData = args.active.data.current;
    const isSidebar = activeData?.source === 'sidebar';
    const isCanvas = activeData?.source === 'canvas';
    const activeType = activeData?.componentType;
    const isKeyboard = !args.pointerCoordinates;

    if (isSidebar || (isCanvas && !isKeyboard)) {
      const containers = pointerCollisions.filter(c => String(c.id).startsWith('container-drop-'));
      if (containers.length > 0) {
        const sorted = containers.sort((a, b) => {
          const zA = a.data?.droppableContainer?.data?.current?.zIndex ?? 0;
          const zB = b.data?.droppableContainer?.data?.current?.zIndex ?? 0;
          return zB - zA;
        });
        return [sorted[0]];
      }
      const canvasCollision = pointerCollisions.find(c => c.id === 'builder-canvas');
      return canvasCollision ? [canvasCollision] : [];
    } else if (isCanvas && isKeyboard) {
      if (activeType === 'Container') {
        return closestCenter({
          ...args,
          droppableContainers: args.droppableContainers.filter((c: any) => c.id === 'builder-canvas')
        });
      } else {
        const parentId = activeData?.parentId;
        if (parentId) {
          return closestCenter({
            ...args,
            droppableContainers: args.droppableContainers.filter((c: any) => c.id === `container-drop-${parentId}`)
          });
        } else {
          return closestCenter({
            ...args,
            droppableContainers: args.droppableContainers.filter((c: any) => c.id === 'builder-canvas')
          });
        }
      }
    } else {
      return pointerCollisions;
    }
  } else if (!args.pointerCoordinates) {
    return closestCenter(args);
  }
  return [];
};

const moveComponentToParent = (
  components: BuilderComponent[],
  componentId: string,
  targetParentId: string | null,
  targetX: number,
  targetY: number
): BuilderComponent[] => {
  return normalizeComponentLayers(
    components.map(comp => {
      if (comp.id === componentId) {
        return {
          ...comp,
          parentId: targetParentId,
          layout: {
            ...comp.layout,
            x: targetX,
            y: targetY,
            zIndex: getHighestZIndex(components, targetParentId) + 1
          }
        };
      }
      return comp;
    })
  );
};


const BuilderPage = () => {
  const { pageId } = useParams<{ pageId: string }>();
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLDivElement>(null);
  
  const [page, setPage] = useState<UiPage | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [components, setComponents] = useState<BuilderComponent[]>([]);
  const [selectedComponentId, setSelectedComponentId] = useState<string | null>(null);
  const [activeSidebarType, setActiveSidebarType] = useState<BuilderComponentType | null>(null);
  const [activeCanvasComponentId, setActiveCanvasComponentId] = useState<string | null>(null);
  const [activeCustomComponentData, setActiveCustomComponentData] = useState<{ id: string, name: string } | null>(null);
  const [dragTargetState, setDragTargetState] = useState<DragTargetState | null>(null);
  
  type RightPanelMode = "properties" | "history";
  const [rightPanelMode, setRightPanelMode] = useState<RightPanelMode>("properties");
  const [historyRefreshToken, setHistoryRefreshToken] = useState(0);
  
  const [saving, setSaving] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string>('');

  const [saveComponentModalOpen, setSaveComponentModalOpen] = useState(false);
  const [saveComponentIsSaving, setSaveComponentIsSaving] = useState(false);
  const [saveComponentError, setSaveComponentError] = useState<string | null>(null);

  const [customComponents, setCustomComponents] = useState<CustomComponentSummary[]>([]);
  const [isLoadingCustomComponents, setIsLoadingCustomComponents] = useState<boolean>(false);
  const [customComponentsError, setCustomComponentsError] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor)
  );

  useEffect(() => {
    const fetchPage = async () => {
      if (!pageId) {
        setError("No page ID provided.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const data = await pageService.getPageById(pageId);
        setPage(data);
        if (data.schema && Array.isArray(data.schema.components)) {
          setComponents(
            normalizeComponentLayers(
              normalizeContainerChildrenLayout(
                normalizeComponentsLayout(
                  normalizeComponentParents(data.schema.components as BuilderComponent[])
                )
              )
            )
          );
        }
      } catch (err: any) {
        setError(err.message || "Failed to load page");
      } finally {
        setLoading(false);
      }
    };

    fetchPage();
  }, [pageId]);

  const loadCustomComponents = useCallback(async () => {
    try {
      setIsLoadingCustomComponents(true);
      setCustomComponentsError(null);
      const data = await customComponentService.getCustomComponents();
      setCustomComponents(data);
    } catch (err: any) {
      setCustomComponentsError(err.message || 'Failed to load custom components');
    } finally {
      setIsLoadingCustomComponents(false);
    }
  }, []);

  useEffect(() => {
    loadCustomComponents();
  }, [loadCustomComponents]);

  const isValidComponentType = (type: unknown): type is BuilderComponentType => {
    return typeof type === 'string' && ['Text', 'Button', 'Input', 'Card', 'Table', 'Select', 'Checkbox', 'Radio', 'Textarea', 'Image', 'Divider', 'Container'].includes(type);
  };

  const handleAddComponent = (type: BuilderComponentType) => {
    const newComponent = createBuilderComponent(type);
    setComponents(prev => {
      const nextZIndex = getHighestZIndex(prev) + 1;
      newComponent.layout = { ...newComponent.layout, zIndex: nextZIndex };
      return [...prev, newComponent];
    });
    setSelectedComponentId(newComponent.id);
  };

  const handleSelectComponent = (componentId: string) => {
    setSelectedComponentId(componentId);
  };

  const handleUpdateComponent = (componentId: string, newProps: Record<string, unknown>) => {
    setComponents(prev => prev.map(comp => 
      comp.id === componentId ? { ...comp, props: newProps } : comp
    ));
  };

  const handleUpdateComponentStyle = <K extends keyof BuilderComponentStyle>(
    componentId: string,
    key: K,
    value: BuilderComponentStyle[K]
  ) => {
    setComponents(prev => {
      let finalValue = value;
      if (key === 'borderWidth' && typeof value === 'number') {
        const targetComp = prev.find(c => c.id === componentId);
        if (targetComp && targetComp.type === 'Container') {
          const maxBorder = getMaxCompatibleContainerBorderWidth(prev, componentId);
          finalValue = Math.min(Math.max(0, value), maxBorder) as any;
        }
      }

      return prev.map(comp =>
        comp.id === componentId
          ? {
              ...comp,
              style: {
                ...(comp.style ?? {}),
                [key]: finalValue
              }
            }
          : comp
      );
    });
  };

  const handleUpdateComponentLayout = <K extends keyof BuilderComponentLayout>(
    componentId: string,
    key: K,
    value: BuilderComponentLayout[K]
  ) => {
    setComponents(prev =>
      prev.map(comp => {
        if (comp.id !== componentId) return comp;
        
        const minDims = MIN_DIMENSIONS_BY_TYPE[comp.type] ?? { width: 50, height: 20 };
        let safeValue = value;
        if (typeof value === 'number') {
          let maxWidth = CANVAS_WIDTH;
          let maxHeight = CANVAS_HEIGHT;

          if (comp.parentId) {
            const parent = prev.find(p => p.id === comp.parentId);
            if (parent) {
              const borderWidth = typeof parent.style?.borderWidth === 'number' 
                ? Math.max(0, parent.style.borderWidth) : CONTAINER_STYLE_DEFAULTS.borderWidth;
              const { innerWidth, innerHeight } = getContainerInnerDimensions(
                parent.layout?.width ?? 300,
                parent.layout?.height ?? 60,
                borderWidth
              );
              maxWidth = innerWidth;
              maxHeight = innerHeight;
            }
          }

          if (key === 'x') safeValue = clamp(value, 0, Math.max(0, maxWidth - (comp.layout?.width ?? 0))) as any;
          else if (key === 'y') safeValue = clamp(value, 0, Math.max(0, maxHeight - (comp.layout?.height ?? 0))) as any;
          else if (key === 'width') safeValue = clamp(value, minDims.width, Math.max(0, maxWidth - (comp.layout?.x ?? 0))) as any;
          else if (key === 'height') safeValue = clamp(value, minDims.height, Math.max(0, maxHeight - (comp.layout?.y ?? 0))) as any;
        }
        
        return {
          ...comp,
          layout: {
            ...(comp.layout ?? {}),
            [key]: safeValue
          }
        };
      })
    );
  };

  const handleResizeComponent = (componentId: string, dimensions: { width: number; height: number }) => {
    setComponents(prev =>
      prev.map(comp => {
        if (comp.id !== componentId) return comp;
        
        return {
          ...comp,
          layout: {
            ...(comp.layout ?? {}),
            width: dimensions.width,
            height: dimensions.height
          }
        };
      })
    );
  };


  const handleDeleteComponent = (componentId: string) => {
    const idsToDelete = getDescendantIds(components, componentId);
    if (selectedComponentId && idsToDelete.has(selectedComponentId)) {
      setSelectedComponentId(null);
    }
    setComponents(prev => {
      const filtered = prev.filter(comp => !idsToDelete.has(comp.id));
      return normalizeComponentLayers(filtered);
    });
  };

  const handleRestoreVersion = async (versionNumber: number) => {
    if (!pageId || !page) return;
    try {
      setError(null);
      const updatedPage = await pageService.restorePageVersion(
        pageId,
        versionNumber,
        page.version
      );
      setPage(updatedPage);
      const restoredComponents = (
        Array.isArray(updatedPage.schema?.components)
          ? updatedPage.schema.components
          : []
      ) as import('../types/page').BuilderComponent[];
      setComponents(
        normalizeComponentLayers(
          normalizeContainerChildrenLayout(
            normalizeComponentsLayout(
              normalizeComponentParents(restoredComponents)
            )
          )
        )
      );
      setSelectedComponentId(prev => {
        if (prev && !restoredComponents.some(c => c.id === prev)) return null;
        return prev;
      });
      setHistoryRefreshToken(prev => prev + 1);
      setSuccessMessage(`Version ${versionNumber} restored successfully`);
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err: any) {
      setError(err.message || "Failed to restore page version");
    }
  };

  const handleSave = async () => {
    if (!pageId || !page) return;

    try {
      setSaving(true);
      setError(null);
      setSuccessMessage('');
      
      const updatedPage = await pageService.updatePage(pageId, {
        schema: { ...page.schema, components }
      });
      
      setPage(updatedPage);
      setHistoryRefreshToken(prev => prev + 1);
      setSuccessMessage("Page saved successfully");
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err: any) {
      setError(err.message || "Failed to save page");
    } finally {
      setSaving(false);
    }
  };

  const handleSubmitForValidation = async () => {
    if (!pageId || !page) return;

    try {
      setSubmitting(true);
      setError(null);
      setSuccessMessage('');
      
      const updatedPage = await pageService.submitPage(pageId);
      setPage(updatedPage);
      setSuccessMessage("Page submitted successfully");
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err: any) {
      setError(err.message || "Failed to submit page");
    } finally {
      setSubmitting(false);
    }
  };

  const handlePreview = () => {
    navigate(`/preview/${pageId}`, {
      state: {
        from: `/builder/${pageId}`
      }
    });
  };

  const handleOpenSaveComponentModal = (componentId: string) => {
    if (!componentId) return;
    setSaveComponentError(null);
    setSaveComponentModalOpen(true);
  };

  const handleSaveCustomComponent = async (name: string, description: string) => {
    if (!selectedComponentId) return;

    try {
      setSaveComponentIsSaving(true);
      setSaveComponentError(null);

      // Extract subtree
      const descendantIds = getDescendantIds(components, selectedComponentId);
      
      // Clone components
      const subtreeComponents = components
        .filter(c => descendantIds.has(c.id))
        .map(c => JSON.parse(JSON.stringify(c)));

      await customComponentService.createCustomComponent({
        name,
        description,
        template: {
          rootComponentId: selectedComponentId,
          components: subtreeComponents
        }
      });

      loadCustomComponents();

      setSaveComponentModalOpen(false);
      setSuccessMessage("Component saved to your library");
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err: any) {
      if (err.status === 409) {
        setSaveComponentError("You already have a component with this name.");
      } else {
        setSaveComponentError(err.message || "Failed to save custom component");
      }
    } finally {
      setSaveComponentIsSaving(false);
    }
  };

  const resetDragState = useCallback(() => {
    setActiveSidebarType(null);
    setActiveCanvasComponentId(null);
    setActiveCustomComponentData(null);
    setDragTargetState(null);
  }, []);

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const isSidebarItem = isSidebarDragData(active.data?.current);
    const isCanvasItem = isCanvasDragData(active.data?.current);
    
    if (isSidebarItem && active.data?.current) {
      const type = active.data.current.componentType as BuilderComponentType;
      if (isValidComponentType(type)) {
        setActiveSidebarType(type);
      }
    } else if (active.data?.current?.source === 'custom-component') {
      setActiveCustomComponentData({
        id: active.data.current.customComponentId,
        name: active.data.current.name
      });
    } else if (isCanvasItem) {
      setActiveCanvasComponentId(active.id as string);
    }
  };

  const handleDragCancel = () => {
    resetDragState();
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over || over.id === 'builder-canvas' || over.data.current?.dropType === 'canvas') {
      setDragTargetState(null);
      return;
    }

    if (isContainerDropData(over.data?.current)) {
      const isSidebar = isSidebarDragData(active.data?.current);
      const isCanvas = isCanvasDragData(active.data?.current);

      let activeDescriptor: ContainerDropActiveDescriptor | null = null;
      if (isSidebar && active.data?.current) {
        const type = active.data.current.componentType as BuilderComponentType;
        const defaultLayout = DEFAULT_LAYOUTS[type] ?? { width: 300, height: 60 };
        activeDescriptor = { type, width: defaultLayout.width, height: defaultLayout.height };
      } else if (isCanvas && active.data?.current) {
        const compId = active.data.current.componentId as string;
        const comp = components.find(c => c.id === compId);
        if (comp) {
          activeDescriptor = {
            type: comp.type,
            width: comp.layout?.width ?? MIN_DIMENSIONS_BY_TYPE[comp.type]?.width ?? 50,
            height: comp.layout?.height ?? MIN_DIMENSIONS_BY_TYPE[comp.type]?.height ?? 20
          };
        }
      }

      const evaluation = evaluateContainerDrop(components, activeDescriptor, over.data.current.containerId);
      
      setDragTargetState(prev => {
        const nextStatus = evaluation.valid ? "valid" : "invalid";
        const targetContainerId = over.data!.current!.containerId;
        if (prev?.containerId === targetContainerId && prev?.status === nextStatus && prev?.reason === evaluation.reason) {
          return prev;
        }
        return {
          containerId: targetContainerId,
          status: nextStatus,
          reason: evaluation.reason
        };
      });
    } else {
      setDragTargetState(null);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    try {
      const { active, over } = event;
      if (!over) return;

      const isCanvasItem = isCanvasDragData(active.data?.current);
      if (isCanvasItem) {
        const activeComponentId = active.id as string;
        const activeComponent = components.find(comp => comp.id === activeComponentId);

        if (!activeComponent || activeComponent.layout?.locked) {
          return;
        }
        
        const translated = active.rect.current.translated;
        if (!translated) return;

        const width = activeComponent.layout?.width ?? 300;
        const height = activeComponent.layout?.height ?? 60;

        let targetParentId: string | null = null;
        let targetRect: { top: number; left: number } = { top: 0, left: 0 };
        let maxWidth = CANVAS_WIDTH;
        let maxHeight = CANVAS_HEIGHT;

        if (over.id === 'builder-canvas' || over.data?.current?.dropType === 'canvas') {
          if (!canvasRef.current) return;
          targetRect = canvasRef.current.getBoundingClientRect();
        } else if (isContainerDropData(over.data?.current)) {
          const containerId = over.data.current.containerId;
          const evaluation = evaluateContainerDrop(components, { type: activeComponent.type, width, height }, containerId);
          if (!evaluation.valid) return;

          const container = components.find(c => c.id === containerId);
          if (!container || !over.rect) return;
          
          targetParentId = containerId;
          const borderWidth = typeof container.style?.borderWidth === 'number' 
              ? Math.max(0, container.style.borderWidth) : CONTAINER_STYLE_DEFAULTS.borderWidth;
          const { innerWidth, innerHeight } = getContainerInnerDimensions(
            container.layout?.width ?? 300,
            container.layout?.height ?? 60,
            borderWidth
          );
          
          targetRect = over.rect;
          maxWidth = innerWidth;
          maxHeight = innerHeight;
        } else {
          return;
        }

        if (width > maxWidth || height > maxHeight) {
          return; 
        }

        const calculatedX = translated.left - targetRect.left;
        const calculatedY = translated.top - targetRect.top;

        const nextX = Math.round(clamp(calculatedX, 0, Math.max(0, maxWidth - width)));
        const nextY = Math.round(clamp(calculatedY, 0, Math.max(0, maxHeight - height)));

        setComponents(prev => moveComponentToParent(prev, activeComponentId, targetParentId, nextX, nextY));
        return;
      }

      const isSidebarItem = isSidebarDragData(active.data?.current);
      if (isSidebarItem && active.data?.current) {
        const type = active.data.current.componentType as BuilderComponentType;
        if (!isValidComponentType(type)) return;

        const defaultLayout = DEFAULT_LAYOUTS[type] ?? { width: 300, height: 60 };
        
        let initialX = 24;
        let initialY = 24;
        let parentId: string | null = null;
        let maxWidth = CANVAS_WIDTH;
        let maxHeight = CANVAS_HEIGHT;
        
        if (isContainerDropData(over.data?.current)) {
          const containerId = over.data.current.containerId;
          const evaluation = evaluateContainerDrop(components, { type, width: defaultLayout.width, height: defaultLayout.height }, containerId);
          
          if (evaluation.valid) {
            const container = components.find(c => c.id === containerId);
            if (container && active.rect.current.translated && over.rect) {
              const borderWidth = typeof container.style?.borderWidth === 'number' 
                  ? Math.max(0, container.style.borderWidth) : CONTAINER_STYLE_DEFAULTS.borderWidth;
              const { innerWidth, innerHeight } = getContainerInnerDimensions(
                container.layout?.width ?? 300,
                container.layout?.height ?? 60,
                borderWidth
              );
              
              parentId = containerId;
              maxWidth = innerWidth;
              maxHeight = innerHeight;
              
              initialX = active.rect.current.translated.left - over.rect.left;
              initialY = active.rect.current.translated.top - over.rect.top;
            }
          } else {
            if (canvasRef.current && active.rect.current.translated) {
              const canvasRect = canvasRef.current.getBoundingClientRect();
              initialX = active.rect.current.translated.left - canvasRect.left;
              initialY = active.rect.current.translated.top - canvasRect.top;
            }
          }
        } else {
          if (canvasRef.current && active.rect.current.translated) {
            const canvasRect = canvasRef.current.getBoundingClientRect();
            initialX = active.rect.current.translated.left - canvasRect.left;
            initialY = active.rect.current.translated.top - canvasRect.top;
          }
        }

        initialX = clamp(initialX, 0, Math.max(0, maxWidth - defaultLayout.width));
        initialY = clamp(initialY, 0, Math.max(0, maxHeight - defaultLayout.height));

        const newComponent = createBuilderComponent(type, initialX, initialY, undefined, parentId);
        
        setComponents(prev => {
          const nextZIndex = getHighestZIndex(prev, parentId) + 1;
          newComponent.layout = { ...newComponent.layout, zIndex: nextZIndex };
          return [...prev, newComponent];
        });
        setSelectedComponentId(newComponent.id);
      } else if (active.data?.current?.source === 'custom-component') {
        if (!canvasRef.current || !active.rect.current.translated) return;
        
        if (isContainerDropData(over.data?.current)) {
          return;
        }

        const targetRect = canvasRef.current.getBoundingClientRect();
        const dropX = active.rect.current.translated.left - targetRect.left;
        const dropY = active.rect.current.translated.top - targetRect.top;
        const customComponentId = active.data.current.customComponentId;

        if (typeof customComponentId !== "string" || customComponentId.trim() === "") {
          setError("Invalid custom component ID");
          setTimeout(() => setError(null), 3000);
          return;
        }

        const executeCustomComponentDrop = async () => {
          try {
            const detail = await customComponentService.getCustomComponent(customComponentId);
            setComponents(prev => {
              const zIndex = getHighestZIndex(prev, null) + 1;
              const instantiatedComponents = instantiateCustomComponent(
                detail.template,
                { x: Math.max(0, dropX), y: Math.max(0, dropY) },
                zIndex
              );
              if (instantiatedComponents.length > 0) {
                const newRootId = instantiatedComponents.find(c => c.parentId === null)?.id;
                if (newRootId) {
                  // Hack to set selected component id after state update in async context
                  setTimeout(() => setSelectedComponentId(newRootId), 0);
                }
                return [...prev, ...instantiatedComponents];
              }
              return prev;
            });
          } catch (err: any) {
            setError(err.message || "Failed to load custom component template");
            setTimeout(() => setError(null), 3000);
          }
        };

        executeCustomComponentDrop();
      }
    } finally {
      resetDragState();
    }
  };

  if (loading) {
    return <div className="builder-loading">Loading builder...</div>;
  }

  if (error && !page) {
    return (
      <div className="builder-error">
        <h2>Error</h2>
        <p>{error}</p>
        <button onClick={() => navigate('/developer/dashboard')} className="btn-primary">
          Back to Dashboard
        </button>
      </div>
    );
  }

  const selectedComponent = components.find(c => c.id === selectedComponentId) || null;

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={customCollisionDetection}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <div className="builder-layout">
        {page && (
          <BuilderHeader 
            page={page} 
            onBack={() => navigate('/developer/dashboard')} 
            onSave={handleSave}
            onPreview={handlePreview}
            onHistoryToggle={() => setRightPanelMode(prev => prev === 'history' ? 'properties' : 'history')}
            onSubmitForValidation={handleSubmitForValidation}
            submitting={submitting}
            saving={saving}
            historyActive={rightPanelMode === 'history'}
          />
        )}
        
        {successMessage && (
          <div className="builder-success-toast">
            {successMessage}
          </div>
        )}
        
        {error && page && (
          <div className="builder-error-toast">
            {error}
          </div>
        )}

        <div className="builder-main">
          <ComponentSidebar 
            onAddComponent={handleAddComponent} 
            customComponents={customComponents}
            isLoadingCustomComponents={isLoadingCustomComponents}
            customComponentsError={customComponentsError}
          />
          
          <BuilderCanvas 
            components={components} 
            selectedComponentId={selectedComponentId} 
            onSelectComponent={handleSelectComponent}
            onResizeComponent={handleResizeComponent}
            canvasRef={canvasRef}
            dragTargetState={dragTargetState}
          />
          
          {rightPanelMode === 'properties' ? (
            <PropertiesPanel 
              selectedComponent={selectedComponent}
              onUpdateProps={handleUpdateComponent}
              onUpdateStyle={handleUpdateComponentStyle}
              onUpdateLayout={handleUpdateComponentLayout}
              onDelete={handleDeleteComponent}
              onSaveAsComponent={handleOpenSaveComponentModal}
            />
          ) : (
            <HistoryPanel
              pageId={pageId!}
              isOpen={rightPanelMode === 'history'}
              refreshToken={historyRefreshToken}
              pageStatus={page?.status ?? 'draft'}
              currentVersion={page?.version ?? 1}
              onRestore={handleRestoreVersion}
              onClose={() => setRightPanelMode('properties')}
            />
          )}
        </div>
      </div>
      {createPortal(
        <DragOverlay zIndex={2000} dropAnimation={null}>
          {activeSidebarType ? (
            <div className="drag-overlay-item">
              {activeSidebarType}
            </div>
          ) : null}
          {activeCustomComponentData ? (
            <div className="drag-overlay-item" style={{ border: '2px solid #3b82f6' }}>
              {activeCustomComponentData.name}
            </div>
          ) : null}
          {activeCanvasComponentId ? (() => {
            const activeComp = components.find(c => c.id === activeCanvasComponentId);
            if (activeComp && activeComp.type !== 'Container') {
              return (
                <div style={{
                  width: activeComp.layout?.width ?? 300,
                  height: activeComp.layout?.height ?? 60,
                  pointerEvents: 'none',
                  opacity: 0.9,
                  boxShadow: '0 10px 25px rgba(0, 0, 0, 0.15)',
                  borderRadius: 'var(--radius-md)'
                }}>
                  <ComponentRenderer component={activeComp} />
                </div>
              );
            }
            return null;
          })() : null}
        </DragOverlay>,
        document.body
      )}
      
      {saveComponentModalOpen && (
        <SaveCustomComponentModal
          onClose={() => setSaveComponentModalOpen(false)}
          onSave={handleSaveCustomComponent}
          isSaving={saveComponentIsSaving}
          error={saveComponentError}
        />
      )}
    </DndContext>
  );
};

export default BuilderPage;
