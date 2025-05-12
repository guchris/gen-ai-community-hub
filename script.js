document.addEventListener('DOMContentLoaded', () => {
    let allProjects = [];
    let allTags = [];

    function renderProjects(projects) {
        const grid = document.querySelector('.projects-grid');
        grid.innerHTML = '';
        projects.forEach(project => {
            const card = document.createElement('div');
            card.className = 'project-card';

            // Header: status badge + tag badges
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
            status.style.cursor = 'pointer';
            status.addEventListener('click', (e) => {
                e.preventDefault();
                // Only select this status in the filter panel
                const statusCheckboxes = document.querySelectorAll('#status-checkboxes input[type=checkbox]');
                let alreadyOnly = true;
                statusCheckboxes.forEach(cb => {
                    if (cb.value === project.contribution_status) {
                        if (!cb.checked) alreadyOnly = false;
                    } else {
                        if (cb.checked) alreadyOnly = false;
                    }
                });
                if (alreadyOnly) return;
                statusCheckboxes.forEach(cb => {
                    cb.checked = (cb.value === project.contribution_status);
                });
                filterAndRender();
            });
            header.appendChild(status);

            // Tag badges (now in header row)
            project.tags.forEach(tag => {
                const tagBadge = document.createElement('span');
                tagBadge.className = 'badge tag';
                tagBadge.textContent = tag;
                tagBadge.style.cursor = 'pointer';
                tagBadge.addEventListener('click', (e) => {
                    e.preventDefault();
                    // Only select this tag in the filter panel
                    const tagCheckboxes = document.querySelectorAll('#tag-checkboxes input[type=checkbox]');
                    let alreadyOnly = true;
                    tagCheckboxes.forEach(cb => {
                        if (cb.value === tag) {
                            if (!cb.checked) alreadyOnly = false;
                        } else {
                            if (cb.checked) alreadyOnly = false;
                        }
                    });
                    if (alreadyOnly) return;
                    tagCheckboxes.forEach(cb => {
                        cb.checked = (cb.value === tag);
                    });
                    filterAndRender();
                });
                header.appendChild(tagBadge);
            });
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

            // Slack channel badge below tags
            if (project.slack_channel) {
                const slackRow = document.createElement('div');
                slackRow.className = 'slack-badge-row';
                const slackLink = document.createElement('a');
                slackLink.className = 'badge slack-badge';
                slackLink.href = project.slack_channel_url || '#';
                slackLink.target = '_blank';
                slackLink.rel = 'noopener noreferrer';
                // Slack logo SVG (accessible, small)
                slackLink.innerHTML = `<span class="slack-logo" style="vertical-align:middle;margin-right:6px;">` +
                    `<svg width="16" height="16" viewBox="0 0 122.8 122.8" style="vertical-align:middle;" xmlns="http://www.w3.org/2000/svg"><g><path fill="#611f69" d="M30.3 77.2c0 8.4-6.8 15.2-15.2 15.2S0 85.6 0 77.2s6.8-15.2 15.2-15.2h15.1v15.2zm7.6 0c0-8.4 6.8-15.2 15.2-15.2s15.2 6.8 15.2 15.2v38.1c0 8.4-6.8 15.2-15.2 15.2s-15.2-6.8-15.2-15.2V77.2z"/><path fill="#36c5f0" d="M45.5 30.3c-8.4 0-15.2-6.8-15.2-15.2S37.1 0 45.5 0s15.2 6.8 15.2 15.2v15.1H45.5zm0 7.6c8.4 0 15.2 6.8 15.2 15.2s-6.8 15.2-15.2 15.2H7.4C-1 68.3-1 61.5 7.4 61.5h38.1z"/><path fill="#2eb67d" d="M92.5 45.5c0-8.4 6.8-15.2 15.2-15.2s15.2 6.8 15.2 15.2-6.8 15.2-15.2 15.2H92.5V45.5zm-7.6 0c0 8.4-6.8 15.2-15.2 15.2s-15.2-6.8-15.2-15.2V7.4C54.5-1 61.3-1 69.7 7.4v38.1z"/><path fill="#ecb22e" d="M77.2 92.5c8.4 0 15.2 6.8 15.2 15.2s-6.8 15.2-15.2 15.2-15.2-6.8-15.2-15.2v-15.1h15.2zm0-7.6c-8.4 0-15.2-6.8-15.2-15.2s6.8-15.2 15.2-15.2h38.1c8.4 0 8.4 6.8 0 15.2H77.2z"/></g></svg></span>` +
                    `<span class="slack-channel-text">${project.slack_channel}</span>`;
                slackRow.appendChild(slackLink);
                card.appendChild(slackRow);
            }

            // Owner and contributors in a single row of badges
            const metaRow = document.createElement('div');
            metaRow.className = 'project-meta-row';
            // Owner badge
            const owner = document.createElement('a');
            owner.className = 'badge owner-badge';
            owner.href = project.owner.url;
            owner.textContent = project.owner.name;
            metaRow.appendChild(owner);
            // Contributor badges
            if (project.contributors && project.contributors.length > 0) {
                project.contributors.forEach(contrib => {
                    const contribA = document.createElement('a');
                    contribA.className = 'badge user-badge';
                    contribA.href = contrib.url;
                    contribA.textContent = contrib.name;
                    metaRow.appendChild(contribA);
                });
            }
            card.appendChild(metaRow);

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