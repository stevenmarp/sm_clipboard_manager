/** @odoo-module **/

import { Component, useState, onMounted, onWillUnmount } from "@odoo/owl";
import { registry } from "@web/core/registry";
import { useService } from "@web/core/utils/hooks";
import { Dropdown } from "@web/core/dropdown/dropdown";
import { DropdownItem } from "@web/core/dropdown/dropdown_item";

class ClipboardManagerSystray extends Component {
    static template = "sm_clipboard_manager.ClipboardManagerSystray";
    static components = { Dropdown, DropdownItem };
    static props = {};

    setup() {
        this.notification = useService("notification");
        
        // Load from localStorage
        const savedHistory = localStorage.getItem('clipboard_history');
        const savedPinned = localStorage.getItem('clipboard_pinned');
        
        this.state = useState({
            history: savedHistory ? JSON.parse(savedHistory) : [],
            pinned: savedPinned ? JSON.parse(savedPinned) : [],
            searchTerm: '',
            maxHistory: 50,
        });
        
        onMounted(() => {
            // Listen for copy events
            this.copyHandler = (e) => {
                const text = window.getSelection().toString();
                if (text && text.trim()) {
                    this.addToHistory(text.trim());
                }
            };
            document.addEventListener('copy', this.copyHandler);
            
            // Global keyboard shortcut: Ctrl+Shift+V for clipboard history
            this.keydownHandler = (e) => {
                if (e.ctrlKey && e.shiftKey && e.key === 'V') {
                    e.preventDefault();
                    // Could trigger dropdown open here
                }
            };
            document.addEventListener('keydown', this.keydownHandler);
        });
        
        onWillUnmount(() => {
            document.removeEventListener('copy', this.copyHandler);
            document.removeEventListener('keydown', this.keydownHandler);
        });
    }

    addToHistory(text) {
        // Don't add duplicates
        if (this.state.history.includes(text)) {
            // Move to top
            this.state.history = this.state.history.filter(h => h !== text);
        }
        
        // Add to front
        this.state.history.unshift(text);
        
        // Limit history
        if (this.state.history.length > this.state.maxHistory) {
            this.state.history = this.state.history.slice(0, this.state.maxHistory);
        }
        
        this.saveHistory();
    }

    saveHistory() {
        localStorage.setItem('clipboard_history', JSON.stringify(this.state.history));
    }

    savePinned() {
        localStorage.setItem('clipboard_pinned', JSON.stringify(this.state.pinned));
    }

    async copyToClipboard(text) {
        try {
            await navigator.clipboard.writeText(text);
            this.notification.add('Copied to clipboard!', { type: 'success', sticky: false });
            
            // Move to top of history
            this.state.history = this.state.history.filter(h => h !== text);
            this.state.history.unshift(text);
            this.saveHistory();
        } catch (e) {
            // Fallback
            const textarea = document.createElement('textarea');
            textarea.value = text;
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand('copy');
            document.body.removeChild(textarea);
            this.notification.add('Copied!', { type: 'success' });
        }
    }

    pinItem(text) {
        if (!this.state.pinned.includes(text)) {
            this.state.pinned.unshift(text);
            this.savePinned();
            this.notification.add('Pinned!', { type: 'info' });
        }
    }

    unpinItem(text) {
        this.state.pinned = this.state.pinned.filter(p => p !== text);
        this.savePinned();
    }

    isPinned(text) {
        return this.state.pinned.includes(text);
    }

    deleteItem(text) {
        this.state.history = this.state.history.filter(h => h !== text);
        this.saveHistory();
    }

    clearHistory() {
        this.state.history = [];
        this.saveHistory();
        this.notification.add('History cleared', { type: 'info' });
    }

    onSearchChange(ev) {
        this.state.searchTerm = ev.target.value.toLowerCase();
    }

    get filteredHistory() {
        if (!this.state.searchTerm) {
            return this.state.history;
        }
        return this.state.history.filter(h => 
            h.toLowerCase().includes(this.state.searchTerm)
        );
    }

    get allItems() {
        // Pinned first, then history (excluding pinned from history)
        const historyWithoutPinned = this.filteredHistory.filter(h => !this.state.pinned.includes(h));
        return [...this.state.pinned, ...historyWithoutPinned];
    }

    truncate(text, maxLength = 80) {
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    }

    getPreview(text) {
        // Return first line or truncated
        const firstLine = text.split('\n')[0];
        return this.truncate(firstLine, 60);
    }

    get historyCount() {
        return this.state.history.length;
    }
}

registry.category("systray").add("sm_clipboard_manager.ClipboardManagerSystray", {
    Component: ClipboardManagerSystray,
}, { sequence: 30 });

export default ClipboardManagerSystray;
