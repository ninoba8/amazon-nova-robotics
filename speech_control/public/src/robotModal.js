// Modal popup for robot selection
export function setupRobotModal() {
  const controls = document.getElementById('controls');
  // Create modal elements
  const modal = document.createElement('div');
  modal.id = 'robot-modal';
  modal.className = 'modal';
  modal.innerHTML = `
    <div class="modal-content">
      <span class="close" id="close-robot-modal">&times;</span>
      <h2>Select Robot(s)</h2>
      <select id="robot-select-modal" multiple size="8">
        <option value="robot_1">Robot 1</option>
        <option value="robot_2">Robot 2</option>
        <option value="robot_3">Robot 3</option>
        <option value="robot_4">Robot 4</option>
        <option value="robot_5">Robot 5</option>
        <option value="robot_6">Robot 6</option>
        <option value="robot_7">Robot 7</option>
        <option value="all">All</option>
      </select>
      <button id="robot-modal-save">Save</button>
    </div>
  `;
  document.body.appendChild(modal);

  // Add open button
  const openBtn = document.createElement('button');
  openBtn.id = 'open-robot-modal';
  openBtn.textContent = 'Select Robot(s)';
  controls.insertBefore(openBtn, controls.firstChild);

  // Hide the old selector
  const robotSelector = document.getElementById('robot-selector');
  if (robotSelector) robotSelector.style.display = 'none';


  // Modal open/close logic
  openBtn.onclick = () => { modal.style.display = 'block'; };
  document.getElementById('close-robot-modal').onclick = () => { modal.style.display = 'none'; };

  // Custom logic for All selection in modal
  const modalSelect = document.getElementById('robot-select-modal');
  modalSelect.addEventListener('change', (event) => {
    const selected = Array.from(modalSelect.selectedOptions).map(opt => opt.value);
    if (selected.includes('all')) {
      // If 'all' is selected, deselect all others
      Array.from(modalSelect.options).forEach(opt => {
        if (opt.value !== 'all') opt.selected = false;
      });
    } else {
      // If any other is selected, deselect 'all'
      const allOpt = Array.from(modalSelect.options).find(opt => opt.value === 'all');
      if (allOpt) allOpt.selected = false;
    }
  });

  document.getElementById('robot-modal-save').onclick = () => {
    // Copy selected options to the hidden select
    const mainSelect = document.getElementById('robot-select');
    Array.from(mainSelect.options).forEach(opt => opt.selected = false);
    Array.from(modalSelect.selectedOptions).forEach(opt => {
      const match = Array.from(mainSelect.options).find(o => o.value === opt.value);
      if (match) match.selected = true;
    });
    modal.style.display = 'none';
    mainSelect.dispatchEvent(new Event('change'));
  };

  // Close modal on outside click
  window.onclick = function(event) {
    if (event.target == modal) {
      modal.style.display = 'none';
    }
  };
}
