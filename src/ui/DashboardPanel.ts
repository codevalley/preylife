import { applyStyles } from '../utils/dom';

/**
 * Oceanic color palette for consistent UI theming
 */
export const OceanicColors = {
  // Backgrounds
  panelBg: 'rgba(8, 25, 45, 0.85)',
  headerBg: 'rgba(5, 18, 35, 0.9)',
  // Borders
  borderPrimary: 'rgba(80, 180, 220, 0.3)',
  borderHighlight: 'rgba(100, 200, 255, 0.5)',
  // Text
  textPrimary: '#e0f0ff',
  textSecondary: '#a0c0d8',
  textMuted: '#6090a8',
  // Entity colors
  prey: '#00ccff',
  predator: '#ff7722',
  resource: '#44ffaa',
  // Accents
  accentCyan: '#00ddff',
  accentWarm: '#ffaa44',
};

export class DashboardPanel {
  private container: HTMLElement;
  private isCollapsed: boolean = false;
  private titleElement: HTMLElement;

  constructor(title: string, id: string, parent: HTMLElement) {
    // Create panel container with glass-morphism
    this.container = document.createElement('div');
    this.container.id = `${id}-panel`;
    this.container.className = 'dashboard-panel';
    applyStyles(this.container, {
      backgroundColor: OceanicColors.panelBg,
      backdropFilter: 'blur(12px)',
      borderRadius: '12px',
      border: `1px solid ${OceanicColors.borderPrimary}`,
      marginBottom: '12px',
      overflow: 'hidden',
      transition: 'all 0.3s ease',
      boxShadow: '0 4px 20px rgba(0, 50, 80, 0.3)',
    });
    // Safari support for backdrop-filter
    (this.container.style as any).webkitBackdropFilter = 'blur(12px)';

    // Create header with title and toggle button
    const header = document.createElement('div');
    header.className = 'panel-header';
    applyStyles(header, {
      padding: '10px 14px',
      fontWeight: '600',
      backgroundColor: OceanicColors.headerBg,
      borderBottom: `1px solid ${OceanicColors.borderPrimary}`,
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      cursor: 'pointer',
      color: OceanicColors.textPrimary,
      fontSize: '13px',
      letterSpacing: '0.5px',
      textTransform: 'uppercase',
    });

    this.titleElement = document.createElement('span');
    this.titleElement.textContent = title;
    applyStyles(this.titleElement, {
      textShadow: '0 0 10px rgba(100, 200, 255, 0.3)',
    });

    const toggleButton = document.createElement('span');
    toggleButton.textContent = '▼';
    applyStyles(toggleButton, {
      fontSize: '10px',
      transition: 'transform 0.3s ease',
      color: OceanicColors.accentCyan,
    });

    header.appendChild(this.titleElement);
    header.appendChild(toggleButton);

    // Create content container
    const content = document.createElement('div');
    content.className = 'panel-content';
    applyStyles(content, {
      padding: '12px 14px',
      color: OceanicColors.textSecondary,
      fontSize: '12px',
      lineHeight: '1.5',
    });

    // Add toggle functionality
    header.addEventListener('click', () => {
      this.isCollapsed = !this.isCollapsed;
      if (this.isCollapsed) {
        content.style.display = 'none';
        toggleButton.textContent = '►';
        toggleButton.style.transform = 'rotate(-90deg)';
      } else {
        content.style.display = 'block';
        toggleButton.textContent = '▼';
        toggleButton.style.transform = 'rotate(0)';
      }
    });

    // Add hover effect
    header.addEventListener('mouseenter', () => {
      this.container.style.borderColor = OceanicColors.borderHighlight;
    });
    header.addEventListener('mouseleave', () => {
      this.container.style.borderColor = OceanicColors.borderPrimary;
    });

    // Assemble panel
    this.container.appendChild(header);
    this.container.appendChild(content);

    // Add to parent
    parent.appendChild(this.container);
  }

  getContentElement(): HTMLElement {
    return this.container.querySelector('.panel-content') as HTMLElement;
  }

  /**
   * Set panel content. Note: Uses innerHTML for internal stats display only.
   * Content is generated internally, not from user input.
   */
  setContent(html: string): void {
    const content = this.getContentElement();
    if (content) {
      // Content is generated internally by the simulation, not user input
      content.innerHTML = html;
    }
  }

  getContainer(): HTMLElement {
    return this.container;
  }

  setTitle(title: string): void {
    this.titleElement.textContent = title;
  }
}
