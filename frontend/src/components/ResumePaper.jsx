import React, { useState, useEffect, useRef } from 'react';
import { Button } from './ui/button';
import { Maximize2, Edit3, Loader2, Mail, Phone, MapPin, Globe, Github, Linkedin } from 'lucide-react';
import NinjaIcon from './NinjaIcon';

const HighlightChange = ({ text = '', changes = [] }) => {
    if (!text || !changes || changes.length === 0) return <>{text}</>;

    const stripMarkdown = (str) => String(str || '').replace(/[\*_~]/g, '');
    const cleanText = stripMarkdown(text);

    const normalize = (str) => {
        if (!str) return '';
        return str.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
    };

    const normText = normalize(cleanText);
    if (!normText) return <>{text}</>;

    const matchedChange = changes.find(c => {
        if (!c.updated) return false;
        const normUpdate = normalize(stripMarkdown(c.updated));
        if (normUpdate.length < 5) return false;
        return normText === normUpdate || normText.includes(normUpdate) || normUpdate.includes(normText);
    });

    if (matchedChange) {
        return <span className="bg-[#bbf7d0] transition-colors" title={matchedChange.reason || 'AI Optimized'}>{text}</span>;
    }

    return <>{text}</>;
};

const AIEditorPopover = ({ sectionKey, title, content, x, y, onClose, onRegenerateSection }) => {
    const actions = [
        { id: 'improve_writing', label: 'Improve Writing', icon: <Edit3 className="w-3.5 h-3.5" /> },
        { id: 'align_jd', label: 'Align with JD', icon: <NinjaIcon className="w-3.5 h-3.5" /> },
        { id: 'add_metrics', label: 'Add Metrics', icon: <span className="text-[10px] font-bold">123</span> },
        { id: 'make_impactful', label: 'Make Impactful', icon: <NinjaIcon className="w-3.5 h-3.5 text-blue-500" /> },
        { id: 'shorten', label: 'Shorten', icon: <Maximize2 className="w-3.5 h-3.5 rotate-45" /> },
        { id: 'expand', label: 'Expand', icon: <Maximize2 className="w-3.5 h-3.5" /> },
        { id: 'bullets_from_jd', label: 'Add Bullets from JD', icon: <NinjaIcon className="w-3.5 h-3.5 text-emerald-500" /> },
        { id: 'rewrite_from_jd', label: 'Rewrite from JD', icon: <NinjaIcon className="w-3.5 h-3.5 text-purple-500" /> },
        { id: 'change_tone', label: 'Change Tone', icon: <Edit3 className="w-3.5 h-3.5 text-orange-500" /> },
        { id: 'custom', label: 'Custom Prompt', icon: <Edit3 className="w-3.5 h-3.5 text-slate-400" /> },
    ];

    return (
        <div
            className="ai-editor-popover no-print"
            style={{
                position: 'absolute',
                top: y + 25,
                left: Math.min(x, 550),
                zIndex: 1000,
                backgroundColor: 'white',
                borderRadius: '12px',
                boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
                border: '1px solid #e2e8f0',
                width: '260px',
                overflow: 'hidden',
                animation: 'popover-in 0.2s ease-out'
            }}
        >
            <div className="p-2 border-b bg-slate-50 flex justify-between items-center">
                <span className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1.5">
                    <NinjaIcon className="w-3 h-3 text-emerald-500" /> AI Editor
                </span>
                <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
                    <span className="text-[10px]">Esc to close</span>
                </button>
            </div>
            <div className="p-1 grid grid-cols-1 gap-0.5">
                {actions.map(action => (
                    <button
                        key={action.id}
                        onClick={() => {
                            if (onRegenerateSection) onRegenerateSection(sectionKey, content, action.id);
                            onClose();
                        }}
                        className="flex items-center gap-2.5 px-3 py-2 text-xs text-left hover:bg-slate-100 rounded-md transition-colors text-slate-700 font-medium"
                    >
                        <span className="w-5 h-5 flex items-center justify-center bg-slate-100 rounded text-slate-500">
                            {action.icon}
                        </span>
                        {action.label}
                    </button>
                ))}
            </div>
        </div>
    );
};

const SectionHeader = ({ title, sectionKey, isModern, editable, onEditSection, onRegenerateSection, sectionContent, setShowAIEditor, showAIEditor, containerRef, baseFontSize = 11 }) => (
    <div className="section-header-container group relative" style={{ margin: '8px 0 0 0' }}>
        <h2 style={{
            fontSize: `${baseFontSize}pt`,
            fontWeight: 700,
            textTransform: 'uppercase',
            borderBottom: isModern ? 'none' : '1px solid black',
            margin: 0,
            padding: 0,
            color: isModern ? '#3b82f6' : '#000',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
        }}>
            {title}
            {editable && (
                <div className="section-actions opacity-0 group-hover:opacity-100 flex gap-1 no-print transition-opacity">
                    <button
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            if (onEditSection) onEditSection(sectionKey, sectionContent);
                        }}
                        className="p-1 hover:bg-slate-100 rounded text-slate-500 hover:text-blue-600 transition-colors"
                        title="Edit Section"
                    >
                        <Edit3 className="w-3 h-3" />
                    </button>
                    <button
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            const rect = e.currentTarget.getBoundingClientRect();
                            const containerRect = containerRef.current.getBoundingClientRect();
                            setShowAIEditor({
                                key: sectionKey,
                                title,
                                content: sectionContent,
                                x: rect.left - containerRect.left,
                                y: rect.top - containerRect.top
                            });
                        }}
                        className="p-1 hover:bg-slate-100 rounded text-slate-500 hover:text-emerald-600 transition-colors"
                        title="AI Editor"
                    >
                        <NinjaIcon className="w-3 h-3" />
                    </button>
                </div>
            )}
        </h2>
        {showAIEditor && showAIEditor.key === sectionKey && (
            <AIEditorPopover
                {...showAIEditor}
                sectionKey={sectionKey}
                onClose={() => setShowAIEditor(null)}
                onRegenerateSection={onRegenerateSection}
            />
        )}
    </div>
);

const ResumePaper = ({
    content,
    resumeChanges = [],
    scale = 1,
    onContentChange,
    fontFamily = '"Times New Roman", Times, serif',
    fontSize = 11,
    template = 'standard',
    editable = true,
    onEditSection,
    onRegenerateSection,
    jobTitle = '',
    contactInfo = { email: '', phone: '', location: '', showIcons: true }
}) => {
    const [parsed, setParsed] = useState(null);
    const containerRef = useRef(null);
    const [showAIEditor, setShowAIEditor] = useState(null);

    const fontMap = {
        'Times New Roman': '"Times New Roman", Times, serif',
        'Arial': 'Arial, Helvetica, sans-serif',
        'Georgia': 'Georgia, serif',
        'Inter': '"Inter", sans-serif',
        'Roboto': '"Roboto", sans-serif',
        'Outfit': '"Outfit", sans-serif',
        'FAANG Font': 'Arial, Helvetica, sans-serif'
    };

    const actualFont = fontMap[fontFamily] || fontFamily;

    useEffect(() => {
        const parseResumeContent = (text) => {
            try {
                if (!text && text !== '') return null;
                const safeText = String(text || '');

                let cleanText = safeText.replace(/ORIGINAL RESUME TEXT:[\s\S]*$/i, '').trim();
                cleanText = cleanText.replace(/ORIGINAL CONTENT:[\s\S]*$/i, '').trim();

                const sections = {
                    header: '',
                    summary: '',
                    skills: '',
                    experience: '',
                    projects: '',
                    education: ''
                };

                const lines = cleanText.split('\n');
                let currentSection = 'header';
                let buffer = [];

                const sectionPatterns = {
                    name: /^#*\s*NAME/i,
                    contact: /^#*\s*CONTACT/i,
                    summary: /^#*\s*(PROFESSIONAL SUMMARY|SUMMARY|PROFILE|OBJECTIVE)/i,
                    skills: /^#*\s*(SKILLS|CORE COMPETENCIES|TECHNICAL SKILLS)/i,
                    experience: /^#*\s*(EXPERIENCE|WORK EXPERIENCE|PROFESSIONAL EXPERIENCE|EMPLOYMENT HISTORY)/i,
                    projects: /^#*\s*(PROJECTS|KEY PROJECTS)/i,
                    education: /^#*\s*(EDUCATION|ACADEMIC BACKGROUND)/i
                };

                for (let line of lines) {
                    const trimmed = line.trim();
                    let matched = false;
                    for (const [key, regex] of Object.entries(sectionPatterns)) {
                        if (regex.test(trimmed) && trimmed.length < 50) {
                            if (buffer.length > 0) {
                                sections[currentSection] = sections[currentSection] + (sections[currentSection] ? '\n' : '') + buffer.join('\n');
                                buffer = [];
                            }
                            currentSection = key;
                            matched = true;
                            break;
                        }
                    }
                    if (!matched) buffer.push(line);
                }

                if (buffer.length > 0) {
                    sections[currentSection] = sections[currentSection] + (sections[currentSection] ? '\n' : '') + buffer.join('\n');
                }

                Object.keys(sections).forEach(key => {
                    if (typeof sections[key] === 'string') {
                        sections[key] = sections[key]
                            .split('\n')
                            .map(line => line.trim())
                            .filter(line => line.length > 0)
                            .join('\n');
                    }
                });

                let name = sections.name || '';
                let contact = sections.contact || '';

                if (!name) {
                    const headerLines = sections.header.split('\n').filter(l => l.trim());
                    name = headerLines[0] || '';
                    if (!contact) {
                        contact = headerLines.slice(1).join(' | ').replace(/\|+/g, ' | ');
                    }
                }

                name = name.replace(/^NAME\n?/i, '').trim();
                contact = contact.replace(/^CONTACT\n?/i, '').trim();

                const isRaw = !sections.summary && !sections.experience && !sections.education && sections.header.length > 20;

                return { ...sections, name, contact, isRaw, rawContent: safeText };
            } catch (err) {
                console.error("Resume parsing error:", err);
                return {
                    header: '', summary: '', skills: '', experience: '', projects: '', education: '',
                    name: 'Error Parsing', contact: '', isRaw: true, rawContent: text
                };
            }
        };

        setParsed(parseResumeContent(content));
    }, [content]);

    if (!parsed) return <div className="p-10 text-center">Loading document...</div>;

    const isModern = template === 'modern';

    return (
        <div
            ref={containerRef}
            className="bg-white shadow-2xl origin-top transition-transform duration-300 relative"
            style={{
                width: '816px',
                minHeight: '1056px',
                transform: `scale(${scale})`,
                padding: '48px',
                fontFamily: actualFont,
                fontSize: `${Math.min(Math.max(fontSize, 9), 12)}pt`,
                color: '#000',
                lineHeight: 1.4
            }}
        >
            <div className="absolute top-4 right-4 flex gap-2 z-10 no-print" style={{ transform: `scale(${1 / scale})`, transformOrigin: 'top right' }}>
                <Button size="sm" className="bg-[#10b981] hover:bg-[#059669] text-white font-bold h-8 text-xs gap-1 shadow-sm">
                    Fit to one page
                </Button>
                {editable && (
                    <Button size="sm" className="bg-[#10b981] hover:bg-[#059669] text-white font-bold h-8 text-xs gap-1 shadow-sm">
                        <Edit3 className="w-3 h-3" /> Edit Mode
                    </Button>
                )}
            </div>

            <div
                className="space-y-1 outline-none"
                contentEditable={editable}
                suppressContentEditableWarning
                onInput={(e) => {
                    if (onContentChange) {
                        onContentChange(e.currentTarget.innerText);
                    }
                }}
            >
                {parsed.isRaw ? (
                    <div className="whitespace-pre-wrap font-serif text-sm leading-relaxed">
                        {parsed.rawContent}
                    </div>
                ) : (
                    <>
                        <div style={{ textAlign: isModern ? 'left' : 'center', marginBottom: '8px' }}>
                            <h1 style={{ fontSize: `${fontSize * 2.2}pt`, fontWeight: 700, textTransform: 'uppercase', margin: 0, padding: 0, color: isModern ? '#1e293b' : '#000' }}>
                                {(() => {
                                    let n = String(parsed.name || '').replace(/[*_]/g, '').replace(/undefined|none|null/gi, '').trim();
                                    if (jobTitle && n.length > 3) {
                                        // Robust removal of jobTitle or partial jobTitle from name
                                        // 1. Try exact match (case insensitive)
                                        const cleanRole = String(jobTitle).replace(/[.*+?${}()|[\]\\]/g, '\\$&');
                                        const fullRegex = new RegExp(cleanRole, 'gi');
                                        n = n.replace(fullRegex, '').trim();

                                        // 2. Try base role match (before - or |)
                                        const baseRole = String(jobTitle).split(/[-|]/)[0].trim();
                                        if (baseRole.length > 3) {
                                            const baseRegex = new RegExp(baseRole.replace(/[.*+?${}()|[\]\\]/g, '\\$&'), 'gi');
                                            n = n.replace(baseRegex, '').trim();
                                        }
                                    }
                                    return n || 'YOUR NAME';
                                })()}
                            </h1>
                            {jobTitle && String(jobTitle).toLowerCase() !== 'undefined' && (
                                <p style={{ fontSize: `${fontSize * 1.2}pt`, fontWeight: 600, margin: '2px 0 0 0', color: isModern ? '#3b82f6' : '#444', textTransform: 'uppercase' }}>
                                    {String(jobTitle).replace(/[*_]/g, '').trim()}
                                </p>
                            )}
                            <div style={{
                                display: 'flex',
                                justifyContent: isModern ? 'flex-start' : 'center',
                                alignItems: 'center',
                                gap: '12px',
                                fontSize: `${fontSize * 0.85}pt`,
                                margin: '4px 0 0 0',
                                padding: 0,
                                color: isModern ? '#64748b' : '#000',
                                flexWrap: 'wrap'
                            }}>
                                {contactInfo.email && (
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                        {contactInfo.showIcons && <Mail className="w-3 h-3" />} {contactInfo.email}
                                    </span>
                                )}
                                {contactInfo.phone && (
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                        {contactInfo.showIcons && <Phone className="w-3 h-3" />} {contactInfo.phone}
                                    </span>
                                )}
                                {contactInfo.location && (
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                        {contactInfo.showIcons && <MapPin className="w-3 h-3" />} {contactInfo.location}
                                    </span>
                                )}
                                {contactInfo.website && (
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                        {contactInfo.showIcons && <Globe className="w-3 h-3" />} {contactInfo.website}
                                    </span>
                                )}
                                {contactInfo.github && (
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                        {contactInfo.showIcons && <Github className="w-3 h-3" />} {contactInfo.github}
                                    </span>
                                )}
                                {contactInfo.linkedin && (
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                        {contactInfo.showIcons && <Linkedin className="w-3 h-3" />} {contactInfo.linkedin}
                                    </span>
                                )}
                                {!contactInfo.email && !contactInfo.phone && !contactInfo.location && parsed.contact && (
                                    <span>{String(parsed.contact || '').replace(/[*_]/g, '')}</span>
                                )}
                            </div>
                            {isModern && <div style={{ height: '4px', background: '#3b82f6', width: '60px', marginTop: '12px' }}></div>}
                        </div>

                        {parsed.summary && (
                            <div style={{ margin: 0, padding: 0 }}>
                                <SectionHeader
                                    title="Professional Summary"
                                    sectionKey="summary"
                                    isModern={isModern}
                                    editable={editable}
                                    onEditSection={onEditSection}
                                    onRegenerateSection={onRegenerateSection}
                                    sectionContent={parsed.summary}
                                    setShowAIEditor={setShowAIEditor}
                                    showAIEditor={showAIEditor}
                                    containerRef={containerRef}
                                    baseFontSize={fontSize}
                                />
                                <p style={{ fontSize: `${fontSize * 0.9}pt`, lineHeight: '1.2', textAlign: 'justify', margin: '2px 0 0 0', padding: 0 }}>
                                    <HighlightChange changes={resumeChanges} text={String(parsed.summary || '').replace(/[*_]/g, '').trim()} />
                                </p>
                            </div>
                        )}

                        {parsed.skills && (
                            <div style={{ margin: 0, padding: 0 }}>
                                <SectionHeader
                                    title="Skills"
                                    sectionKey="skills"
                                    isModern={isModern}
                                    editable={editable}
                                    onEditSection={onEditSection}
                                    onRegenerateSection={onRegenerateSection}
                                    sectionContent={parsed.skills}
                                    setShowAIEditor={setShowAIEditor}
                                    showAIEditor={showAIEditor}
                                    containerRef={containerRef}
                                    baseFontSize={fontSize}
                                />
                                <div style={{ fontSize: `${fontSize * 0.9}pt`, lineHeight: '1.2', margin: '2px 0 0 0', padding: 0 }}>
                                    {String(parsed.skills || '').split('\n').filter(l => l.trim()).map((skillLine, i) => (
                                        <div key={i} style={{ margin: 0, padding: 0 }}>• <HighlightChange changes={resumeChanges} text={String(skillLine || '').replace(/^([•\-\*]|#+)\s*/, '').replace(/[*_]/g, '')} /></div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {parsed.experience && (
                            <div style={{ margin: 0, padding: 0 }}>
                                <SectionHeader
                                    title="Experience"
                                    sectionKey="experience"
                                    isModern={isModern}
                                    editable={editable}
                                    onEditSection={onEditSection}
                                    onRegenerateSection={onRegenerateSection}
                                    sectionContent={parsed.experience}
                                    setShowAIEditor={setShowAIEditor}
                                    showAIEditor={showAIEditor}
                                    containerRef={containerRef}
                                    baseFontSize={fontSize}
                                />
                                <div style={{ fontSize: `${fontSize * 0.9}pt`, lineHeight: '1.2', margin: '2px 0 0 0', padding: 0 }}>
                                    {String(parsed.experience || '').split('\n').map((line, i, arr) => {
                                        const trimmed = String(line || '').trim();
                                        if (!trimmed) return null;
                                        const cleanLine = trimmed.replace(/^([*_]+)(.*?)([*_]+)$/, '$2');
                                        const isBullet = /^[•\-\*·‣◘◦]/.test(cleanLine) || /^\d+\./.test(cleanLine);
                                        if (isBullet) {
                                            return <div key={i} style={{ paddingLeft: '12px' }}><HighlightChange changes={resumeChanges} text={cleanLine.replace(/[*_]/g, '')} /></div>;
                                        } else {
                                            const prevLineEmpty = i === 0 || !String(arr[i - 1] || '').trim();
                                            const hasSeparator = (trimmed.includes(" — ") || trimmed.includes(" | ") || trimmed.includes(" – "));
                                            const hasDate = /\d{4}/.test(trimmed) || /(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)/i.test(trimmed);
                                            const isLikelyHeader = (prevLineEmpty || (hasSeparator && trimmed.length < 150) || hasDate) && !trimmed.endsWith('.');
                                            const weight = isLikelyHeader ? 700 : 'normal';
                                            return <div key={i} style={{ fontWeight: weight, marginTop: prevLineEmpty ? '4px' : '0' }}><HighlightChange changes={resumeChanges} text={trimmed.replace(/[*_]/g, '')} /></div>;
                                        }
                                    })}
                                </div>
                            </div>
                        )}

                        {parsed.projects && (
                            <div style={{ margin: 0, padding: 0 }}>
                                <SectionHeader
                                    title="Projects"
                                    sectionKey="projects"
                                    isModern={isModern}
                                    editable={editable}
                                    onEditSection={onEditSection}
                                    onRegenerateSection={onRegenerateSection}
                                    sectionContent={parsed.projects}
                                    setShowAIEditor={setShowAIEditor}
                                    showAIEditor={showAIEditor}
                                    containerRef={containerRef}
                                    baseFontSize={fontSize}
                                />
                                <div style={{ fontSize: `${fontSize * 0.9}pt`, lineHeight: '1.2', margin: '2px 0 0 0', padding: 0 }}>
                                    {parsed.projects.split('\n').map((line, i, arr) => {
                                        const trimmed = line.trim();
                                        if (!trimmed) return null;
                                        const cleanLine = trimmed.replace(/^([*_]+)(.*?)([*_]+)$/, '$2');
                                        const isBullet = /^[•\-\*·‣◘◦]/.test(cleanLine) || /^\d+\./.test(cleanLine);
                                        if (isBullet) {
                                            return <div key={i} style={{ paddingLeft: '12px' }}><HighlightChange changes={resumeChanges} text={cleanLine.replace(/[*_]/g, '')} /></div>;
                                        } else {
                                            const prevLineEmpty = i === 0 || !String(arr[i - 1] || '').trim();
                                            const hasSeparator = (trimmed.includes(" — ") || trimmed.includes(" | ") || trimmed.includes(" – "));
                                            const isLikelyHeader = (prevLineEmpty || (hasSeparator && trimmed.length < 150)) && !trimmed.endsWith('.');
                                            const weight = isLikelyHeader ? 700 : 'normal';
                                            return <div key={i} style={{ fontWeight: weight, marginTop: prevLineEmpty ? '4px' : '0' }}><HighlightChange changes={resumeChanges} text={trimmed.replace(/[*_]/g, '')} /></div>;
                                        }
                                    })}
                                </div>
                            </div>
                        )}

                        {parsed.education && (
                            <div style={{ margin: 0, padding: 0 }}>
                                <SectionHeader
                                    title="Education"
                                    sectionKey="education"
                                    isModern={isModern}
                                    editable={editable}
                                    onEditSection={onEditSection}
                                    onRegenerateSection={onRegenerateSection}
                                    sectionContent={parsed.education}
                                    setShowAIEditor={setShowAIEditor}
                                    showAIEditor={showAIEditor}
                                    containerRef={containerRef}
                                    baseFontSize={fontSize}
                                />
                                <div style={{ fontSize: `${fontSize * 0.9}pt`, lineHeight: '1.2', whiteSpace: 'pre-wrap', margin: '2px 0 0 0', padding: 0 }}>
                                    <HighlightChange changes={resumeChanges} text={parsed.education.replace(/[*_]/g, '').trim()} />
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>

            <div className="absolute bottom-4 left-0 right-0 text-center no-print">
                <span className="bg-black text-white text-xs font-bold px-3 py-1 rounded-full opacity-80">1/1</span>
            </div>
        </div>
    );
};

export default ResumePaper;
