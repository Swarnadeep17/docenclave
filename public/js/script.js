fetch('/config/tools.json')
  .then(response => response.json())
  .then(data => {
    const fileTypesContainer = document.getElementById('file-types');

    data.forEach(fileTypeData => {
      const fileTypeElement = document.createElement('div');
      fileTypeElement.classList.add('file-type');

      const fileTypeName = document.createElement('h3');
      fileTypeName.textContent = fileTypeData.fileType;
      fileTypeElement.appendChild(fileTypeName);

      fileTypeData.tools.forEach(toolData => {
        const toolElement = document.createElement('div');
        toolElement.classList.add('tool');

        const toolName = document.createElement('h4');
        toolName.textContent = toolData.name;
        toolElement.appendChild(toolName);

        const toolDescription = document.createElement('p');
        toolDescription.textContent = toolData.description;
        toolElement.appendChild(toolDescription);

        if (toolData.status === 'coming_soon') {
          const comingSoonSpan = document.createElement('span');
          comingSoonSpan.textContent = '(Coming Soon)';
          comingSoonSpan.classList.add('coming-soon');
          toolElement.appendChild(comingSoonSpan);
        }
        fileTypeElement.appendChild(toolElement);
      });
      fileTypesContainer.appendChild(fileTypeElement);
    });
  })
  .catch(error => {
    console.error('Error fetching tools data:', error);
  });

// Add event listeners to make file type sections expandable
document.addEventListener('DOMContentLoaded', () => {
  const fileTypeElements = document.querySelectorAll('.file-type');

  fileTypeElements.forEach(fileTypeElement => {
    const fileTypeName = fileTypeElement.querySelector('h3');
    fileTypeName.addEventListener('click', () => {
      fileTypeElement.classList.toggle('expanded');
    });
  });
});