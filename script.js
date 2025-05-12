document.addEventListener('DOMContentLoaded', () => {
    let allProjects = [];
    let allTags = [];

    function renderProjects(projects) {
        const grid = document.querySelector('.projects-grid');
        grid.innerHTML = '';
        projects.forEach(project => {
            const card = document.createElement('div');
            card.className = 'project-card';

            // Header: status badge only
            const header = document.createElement('div');
            header.className = 'project-card-header';

            // Status badge
            const status = document.createElement('span');
            status.className = 'badge status ' + (project.contribution_status === 'open' ? 'open' : (project.contribution_status === 'closed' ? 'closed' : 'inprogress'));
            status.textContent = project.contribution_status.charAt(0).toUpperCase() + project.contribution_status.slice(1);
            if (project.contribution_status === 'in progress') {
                status.style.background = '#fffbe6';
                status.style.color = '#b38600';
                status.style.border = '1.5px solid #b38600';
            }
            header.appendChild(status);
            card.appendChild(header);

            // Title
            const title = document.createElement('h3');
            title.textContent = project.title;
            card.appendChild(title);

            // Description (larger font)
            const desc = document.createElement('p');
            desc.className = 'project-desc large-desc';
            desc.textContent = project.description;
            card.appendChild(desc);

            // Tags (below description)
            const tagsRow = document.createElement('div');
            tagsRow.className = 'project-tags-row';
            project.tags.forEach(tag => {
                const tagBadge = document.createElement('span');
                tagBadge.className = 'badge tag';
                tagBadge.textContent = tag;
                tagsRow.appendChild(tagBadge);
            });
            card.appendChild(tagsRow);

            // Owner (own line, small)
            const ownerRow = document.createElement('div');
            ownerRow.className = 'project-meta meta-small';
            const ownerLabel = document.createElement('span');
            ownerLabel.className = 'meta-label';
            ownerLabel.textContent = 'Owner:';
            ownerRow.appendChild(ownerLabel);
            const owner = document.createElement('a');
            owner.className = 'badge user-badge';
            owner.href = project.owner.url;
            owner.textContent = project.owner.name;
            ownerRow.appendChild(owner);
            card.appendChild(ownerRow);

            // Contributors (own line, small)
            if (project.contributors && project.contributors.length > 0) {
                const contribRow = document.createElement('div');
                contribRow.className = 'project-meta meta-small';
                const contribLabel = document.createElement('span');
                contribLabel.className = 'meta-label';
                contribLabel.textContent = 'Contributors:';
                contribRow.appendChild(contribLabel);
                project.contributors.forEach(contrib => {
                    const contribA = document.createElement('a');
                    contribA.className = 'badge user-badge';
                    contribA.href = contrib.url;
                    contribA.textContent = contrib.name;
                    contribRow.appendChild(contribA);
                });
                card.appendChild(contribRow);
            }

            grid.appendChild(card);
        });
    }

    function getCheckedValues(containerId) {
        return Array.from(document.querySelectorAll(`#${containerId} input[type=checkbox]:checked`)).map(cb => cb.value);
    }

    function getSearchValue() {
        return document.getElementById('search').value.trim().toLowerCase();
    }

    function filterAndRender() {
        const selectedStatuses = getCheckedValues('status-checkboxes');
        const selectedTags = getCheckedValues('tag-checkboxes');
        const search = getSearchValue();
        const filtered = allProjects.filter(project => {
            const statusMatch = selectedStatuses.includes(project.contribution_status);
            // Tag filter: if no tags selected, show all; else, must match at least one
            const tagMatch = selectedTags.length === 0 || project.tags.some(tag => selectedTags.includes(tag));
            const searchMatch =
                project.title.toLowerCase().includes(search) ||
                project.description.toLowerCase().includes(search) ||
                project.tags.some(tag => tag.toLowerCase().includes(search));
            return statusMatch && tagMatch && (!search || searchMatch);
        });
        renderProjects(filtered);
    }

    function renderStatusCheckboxes() {
        const statuses = [
            { value: 'open', label: 'Open' },
            { value: 'in progress', label: 'In Progress' },
            { value: 'closed', label: 'Closed' }
        ];
        const container = document.getElementById('status-checkboxes');
        container.innerHTML = '';
        statuses.forEach(status => {
            const label = document.createElement('label');
            label.className = 'filter-checkbox-label';
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.value = status.value;
            checkbox.className = 'filter-checkbox';
            checkbox.checked = true;
            checkbox.addEventListener('change', filterAndRender);
            label.appendChild(checkbox);
            label.appendChild(document.createTextNode(status.label));
            container.appendChild(label);
        });
    }

    function renderTagCheckboxes() {
        const tagSet = new Set();
        allProjects.forEach(project => project.tags.forEach(tag => tagSet.add(tag)));
        allTags = Array.from(tagSet).sort();
        const container = document.getElementById('tag-checkboxes');
        container.innerHTML = '';
        allTags.forEach(tag => {
            const label = document.createElement('label');
            label.className = 'filter-checkbox-label';
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.value = tag;
            checkbox.className = 'filter-checkbox';
            checkbox.checked = true;
            checkbox.addEventListener('change', filterAndRender);
            label.appendChild(checkbox);
            label.appendChild(document.createTextNode(tag));
            container.appendChild(label);
        });
    }

    // Collapse/expand filter sections
    function setupFilterCollapsing() {
        document.querySelectorAll('#filter-panel .filter-title').forEach(title => {
            title.addEventListener('click', () => {
                const section = title.parentElement;
                section.classList.toggle('collapsed');
            });
        });
    }

    fetch('projects.json')
        .then(res => res.json())
        .then(projects => {
            allProjects = projects;
            renderStatusCheckboxes();
            renderTagCheckboxes();
            renderProjects(allProjects);
            document.getElementById('search').addEventListener('input', filterAndRender);
            setupFilterCollapsing();
        });
});