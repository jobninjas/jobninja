import React from 'react';
import {
    FileText,
    Palette,
    Eye,
    Settings,
    HelpCircle
} from 'lucide-react';
import NinjaIcon from './NinjaIcon';
import './EditorSidebar.css';

const EditorSidebar = ({ activeTab, setActiveTab }) => {
    const mainItems = [
        { id: 'resume', icon: FileText, label: 'Resume' },
        { id: 'design', icon: Palette, label: 'Design' },
        { id: 'ai', icon: NinjaIcon, label: 'AI Tools' },
        { id: 'preview', icon: Eye, label: 'Preview' },
    ];

    const bottomItems = [
        { id: 'settings', icon: Settings, label: 'Settings' },
        { id: 'help', icon: HelpCircle, label: 'Help' },
    ];

    return (
        <aside className="editor-sidebar-slim">
            <div className="sidebar-top">
                {mainItems.map((item) => (
                    <button
                        key={item.id}
                        className={`sidebar-item ${activeTab === item.id ? 'active' : ''}`}
                        onClick={() => setActiveTab(item.id)}
                        title={item.label}
                    >
                        <item.icon className="w-5 h-5" />
                        <span className="item-label">{item.label}</span>
                    </button>
                ))}
            </div>

            <div className="sidebar-bottom">
                {bottomItems.map((item) => (
                    <button
                        key={item.id}
                        className="sidebar-item"
                        title={item.label}
                    >
                        <item.icon className="w-5 h-5" />
                    </button>
                ))}
            </div>
        </aside>
    );
};

export default EditorSidebar;
