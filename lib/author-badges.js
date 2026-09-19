const people = [
  ['Gaurav Singh', 'GS', '/people/gaurav-singh/', ['G. Singh']],
  ['Rahul Singh Dhari', 'RS', '/people/rahul-singh-dhari/', ['R. S. Dhari', 'Rahul Singh']],
  ['Zia Javanbakht', 'ZJ', '', ['Z. Javanbakht']],
  ['Nirav P. Patel', 'NP', '', ['N. P. Patel', 'Nirav Patel']],
  ['Elizabeth Chang', 'EC'], ['Yeliz Karaca', 'YK'],
  ['Naveen Bagalkot', 'NB', '', ['Naveen L. Bagalkot']],
  ['Vineeta Rath', 'VR'], ['Tomas Sokoler', 'TS'], ['Anchit Shukla', 'AS'],
  ['Riyaj Shaikh', 'RS'], ['Suraj Baadkar', 'SB'], ['Atul Saraf', 'AS'],
  ['Ian J. Davies', 'ID'], ['Finn Lappin', 'FL'], ['Martina Lattemann', 'ML'],
  ['Rajat Pal', 'RP'], ['Wayne Hall', 'WH'], ['Stefanie Feih', 'SF'],
  ['Akshay Asthana', 'AA'], ['Hongxu Wang', 'HW'], ['Paul J. Hazell', 'PH'],
  ['Jaykumar Gadhiya', 'JG'], ['Milanpuri Goswami', 'MG'],
  ['Dharmendra S. Sharma', 'DS'], ['Aravind Sekar', 'AS']
];

function badgePalette(name) {
  const index = people.findIndex(person => person[0] === name || (person[3] || []).includes(name));
  const hue = index === 0 ? 20 : index === 1 ? 160 : index >= 0 ? Math.round(index * 137.508) % 360 : 280;
  return {
    background: `hsl(${hue} 35% 88%)`,
    ink: `hsl(${hue} 35% 29%)`
  };
}
function paletteStyle(name) {
  const palette = badgePalette(name);
  return `--badge-background: ${palette.background}; --badge-ink: ${palette.ink}`;
}

const escape = value => String(value).replace(/[&<>"']/g, char => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
})[char]);

module.exports = function authorBadges(authors) {
  return String(authors || '').replace(/<[^>]*>/g, '').split(',').map(name => {
    name = name.trim();
    if (!name) return '';
    if (name === 'et al.') return '<span class="author-more">et al.</span>';
    const index = people.findIndex(person => person[0] === name || (person[3] || []).includes(name));
    const person = people[index];
    const fullName = person ? person[0] : name;
    const initials = person ? person[1] : name.split(/\s+/).map(word => word[0]).slice(0, 2).join('').toUpperCase();
    const palette = badgePalette(fullName);
    const attributes = `class="author-badge" style="${paletteStyle(fullName)}" title="${escape(fullName)}" aria-label="${escape(fullName)}"`;
    const content = `<span class="author-initials" aria-hidden="true">${escape(initials)}</span><span class="author-name" aria-hidden="true">${escape(fullName)}</span>`;
    return person && person[2]
      ? `<a ${attributes} href="${person[2]}">${content}</a>`
      : `<span ${attributes} role="img" tabindex="0">${content}</span>`;
  }).join('');
};

module.exports.initials = function authorInitials(name) {
  const person = people.find(person => person[0] === name || (person[3] || []).includes(name));
  return person ? person[1] : String(name).split(/\s+/).map(word => word[0]).slice(0, 2).join('').toUpperCase();
};

module.exports.paletteStyle = paletteStyle;
