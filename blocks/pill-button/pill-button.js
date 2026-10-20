export default function decorate(block) {
  // 1. Extraer las filas configuradas desde AEM
  const rows = Array.from(block.children);
  const options = {};

  rows.forEach((row, index) => {
    const cell = row.children.length === 2 ? row.children[1] : row.children[0];
    if (!cell) return;

    switch (index) {
      case 0: options.label = cell.textContent.trim(); break;
      case 1: options.link = cell.textContent.trim() || '#'; break;
      case 2: options.variant = cell.textContent.trim().toLowerCase() === 'compact' ? 'compact' : 'default'; break;
      case 3: options.showIconBefore = cell.textContent.trim().toLowerCase() === 'true'; break;
      case 4: options.iconBeforeHTML = cell.querySelector('picture, img, svg')?.outerHTML || ''; break;
      case 5: options.showIconAfter = cell.textContent.trim().toLowerCase() === 'true'; break;
      case 6: options.iconAfterHTML = cell.querySelector('picture, img, svg')?.outerHTML || ''; break;
      default: break;
    }
  });

  // 2. Limpiar el bloque original
  block.innerHTML = '';

  // 3. Crear el elemento enlace/botón
  const button = document.createElement('a');
  button.href = options.link;
  button.className = `pill-btn pill-btn--${options.variant}`;

  // 4. Inyectar Icono Before si está habilitado
  if (options.showIconBefore && options.iconBeforeHTML) {
    const iconBeforeContainer = document.createElement('span');
    iconBeforeContainer.className = 'pill-btn__icon pill-btn__icon--before';
    iconBeforeContainer.innerHTML = options.iconBeforeHTML;
    button.appendChild(iconBeforeContainer);
  }

  // 5. Inyectar el Texto (Label)
  const labelText = document.createElement('span');
  labelText.className = 'pill-btn__label';
  labelText.textContent = options.label || 'Label';
  button.appendChild(labelText);

  // 6. Inyectar Icono After si está habilitado
  if (options.showIconAfter && options.iconAfterHTML) {
    const iconAfterContainer = document.createElement('span');
    iconAfterContainer.className = 'pill-btn__icon pill-btn__icon--after';
    iconAfterContainer.innerHTML = options.iconAfterHTML;
    button.appendChild(iconAfterContainer);
  }

  // 7. Adjuntar el botón final al bloque
  block.appendChild(button);
}