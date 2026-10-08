export default async function decorate(block) {
  const rows = Array.from(block.children);
  const titleText = rows[0]?.textContent.trim() || 'Transacciones realizadas';
  const emptyStateImageHTML = rows[1]?.querySelector('picture')?.outerHTML || '';
  const emptyStateTitle = rows[2]?.textContent.trim() || 'No has realizado transacciones con tu avianca credits';
  const emptyStateSubtitleHTML = rows[3]?.querySelector('div')?.innerHTML || 'Si tienes dudas sobre cómo usar tu avianca credits, consulta nuestro <a href="#">Centro de ayuda</a>.';

  block.innerHTML = '';

  // 1. TÍTULO PRINCIPAL INSTRUMENTADO
  const header = document.createElement('h3');
  header.className = 'transactions-header-title';
  header.textContent = titleText;
  
  // ¡NUEVO!: Enlazamos el título con el field "title" del model
  header.setAttribute('data-aue-prop', 'title');
  header.setAttribute('data-aue-type', 'text');
  header.setAttribute('data-aue-label', 'Title');
  
  block.appendChild(header);

  const contentWrapper = document.createElement('div');
  contentWrapper.className = 'transactions-content-wrapper';
  block.appendChild(contentWrapper);

  const renderTransactions = (transactionsData) => {
    contentWrapper.innerHTML = '';

    if (!transactionsData || transactionsData.length === 0) {
      // 2. ESTADO VACÍO INSTRUMENTADO
      // ¡NUEVO!: Se agregan los data-aue-* a cada contenedor del Empty State
      contentWrapper.innerHTML = `
        <div class="transactions-empty-state">
          <div class="empty-state-icon" data-aue-prop="emptyStateImage" data-aue-type="reference" data-aue-label="Empty State Image">
            ${emptyStateImageHTML}
          </div>
          <h4 class="empty-state-title" data-aue-prop="emptyStateTitle" data-aue-type="text" data-aue-label="Empty State Title">
            ${emptyStateTitle}
          </h4>
          <div class="empty-state-subtitle" data-aue-prop="emptyStateSubtitle" data-aue-type="richtext" data-aue-label="Empty State Subtitle">
            ${emptyStateSubtitleHTML}
          </div>
        </div>
      `;
      return;
    }

    // ... (El resto del código de la VISTA 1 con transacciones se mantiene igual)
    const listWrapper = document.createElement('div');
    listWrapper.className = 'transactions-list';

    const latestTransactions = transactionsData.slice(0, 3);

    latestTransactions.forEach((tx) => {
      // Iconos SVG en línea basados en el diseño
      const iconSuccess = `<svg width="16" height="16" viewBox="0 0 24 24" fill="#00a650"><path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm-1.997-7.17l7.07-7.071-1.414-1.414-5.656 5.657-2.829-2.829-1.414 1.414 4.243 4.243z"/></svg>`;
      const iconError = `<svg width="16" height="16" viewBox="0 0 24 24" fill="#e3000f"><path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm3.536-12.121L14.12 8.464 12 10.586 9.879 8.464 8.464 9.88l2.122 2.121-2.122 2.122 1.415 1.414L12 13.414l2.121 2.122 1.415-1.414-2.122-2.122 2.122-2.121z"/></svg>`;
      
      const isSuccess = tx.status.toLowerCase() === 'aprobado';
      const statusIcon = isSuccess ? iconSuccess : iconError;

      const card = document.createElement('div');
      card.className = 'transaction-card';
      card.innerHTML = `
        <div class="tx-info-left">
          <p class="tx-pnr">Código de reserva: <strong>${tx.pnr}</strong></p>
          <p class="tx-details">${tx.date} | ${tx.status} <span class="tx-icon">${statusIcon}</span></p>
        </div>
        <div class="tx-info-right">
          <p class="tx-amount"><strong>${tx.currency} ${tx.amount}</strong></p>
        </div>
      `;
      listWrapper.appendChild(card);
    });

    contentWrapper.appendChild(listWrapper);
  };

  // 5. MOCK DE DATOS (Puedes reemplazar esto con tu llamada a la API)
  // Para probar la vista vacía, pasa un array vacío: renderTransactions([])
  const mockData = [
    { pnr: '3VPN78', date: '10 Jun 2026', status: 'Aprobado', currency: 'COP', amount: '486.025' },
    { pnr: 'F4FNG1', date: '10 Jun 2026', status: 'Aprobado', currency: 'COP', amount: '555.234' },
    { pnr: 'P9FN4N', date: '19 May 2026', status: 'Rechazado', currency: 'COP', amount: '555.234' }
  ];

  // Ejecutamos el render
  renderTransactions(mockData);
}