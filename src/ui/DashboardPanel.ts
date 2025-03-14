export class DashboardPanel {
  private container: HTMLElement;
  private isCollapsed: boolean = false;
  private titleElement: HTMLElement;
  
  constructor(title: string, id: string, parent: HTMLElement) {
    // Create panel container
    this.container = document.createElement('div');
    this.container.id = `${id}-panel`;
    this.container.className = 'dashboard-panel';
    this.container.style.cssText = `
      background-color: rgba(0, 0, 0, 0.7);
      border-radius: 4px;
      border: 1px solid #444;
      margin-bottom: 10px;
      overflow: hidden;
      transition: height 0.3s ease;
    `;
    
    // Create header with title and toggle button
    const header = document.createElement('div');
    header.className = 'panel-header';
    header.style.cssText = `
      padding: 8px 10px;
      font-weight: bold;
      background-color: rgba(0, 0, 0, 0.4);
      border-bottom: 1px solid #444;
      display: flex;
      justify-content: space-between;
      align-items: center;
      cursor: pointer;
    `;
    
    this.titleElement = document.createElement('span');
    this.titleElement.textContent = title;
    
    const toggleButton = document.createElement('span');
    toggleButton.textContent = '▼';
    toggleButton.style.cssText = `
      font-size: 10px;
      transition: transform 0.3s ease;
    `;
    
    header.appendChild(this.titleElement);
    header.appendChild(toggleButton);
    
    // Create content container
    const content = document.createElement('div');
    content.className = 'panel-content';
    content.style.cssText = `
      padding: 10px;
    `;
    
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
    
    // Assemble panel
    this.container.appendChild(header);
    this.container.appendChild(content);
    
    // Add to parent
    parent.appendChild(this.container);
  }
  
  getContentElement(): HTMLElement {
    return this.container.querySelector('.panel-content') as HTMLElement;
  }
  
  setContent(html: string): void {
    const content = this.getContentElement();
    if (content) {
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