/**
 * Build styles
 */
require('./index.css').toString();

/**
 * Strikethrough Tool for the Editor.js
 * Allows to wrap inline fragment and style it somehow.
 */
class Strikethrough {
    /**
     * Class name for term-tag
     *
     * @type {string}
     */
    static get CSS() {
        return 'cdx-strikethrough';
    };

    /**
     */
    constructor({api}) {
        this.api = api;

        /**
         * Toolbar Button
         *
         * @type {HTMLElement|null}
         */
        this.button = null;

        /**
         * Tag represented the term
         *
         * @type {string}
         */
        this.tag = 'DEL';

        /**
         * CSS classes
         */
        this.iconClasses = {
            base: this.api.styles.inlineToolButton,
            active: this.api.styles.inlineToolButtonActive
        };
    }

    /**
     * Specifies Tool as Inline Toolbar Tool
     *
     * @return {boolean}
     */
    static get isInline() {
        return true;
    }

    /**
     * Create button element for Toolbar
     *
     * @return {HTMLElement}
     */
    render() {
        this.button = document.createElement('button');
        this.button.type = 'button';
        this.button.classList.add(this.iconClasses.base);
        this.button.innerHTML = this.toolboxIcon;

        return this.button;
    }

    /**
     * Wrap/Unwrap selected fragment
     *
     * @param {Range} range - selected fragment
     */
    surround(range) {
        if (!range) {
            return;
        }

        let termWrapper = this.api.selection.findParentTag(this.tag, Strikethrough.CSS);

        /**
         * If start or end of selection is in the highlighted block
         */
        if (termWrapper) {
            this.unwrap(termWrapper);
        } else {
            this.wrap(range);
        }
    }

    /**
     * Wrap selection with term-tag
     *
     * @param {Range} range - selected fragment
     */
    wrap(range) {
        /**
         * Create a wrapper for highlighting
         */
        let delElement = document.createElement(this.tag);

        delElement.classList.add(Strikethrough.CSS);

        /**
         * SurroundContent throws an error if the Range splits a non-Text node with only one of its boundary points
         * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Range/surroundContents}
         *
         * // range.surroundContents(del);
         */
        delElement.appendChild(range.extractContents());
        range.insertNode(delElement);

        /**
         * Expand (add) selection to highlighted block
         */
        this.api.selection.expandToTag(delElement);
    }

    /**
     * Unwrap term-tag
     *
     * @param {HTMLElement} termWrapper - term wrapper tag
     */
    unwrap(termWrapper) {
        /**
         * Expand selection to all term-tag
         */
        this.api.selection.expandToTag(termWrapper);

        let sel = window.getSelection();
        let range = sel.getRangeAt(0);

        let unwrappedContent = range.extractContents();

        /**
         * Remove empty term-tag
         */
        termWrapper.parentNode.removeChild(termWrapper);

        /**
         * Insert extracted content
         */
        range.insertNode(unwrappedContent);

        /**
         * Restore selection
         */
        sel.removeAllRanges();
        sel.addRange(range);
    }

    /**
     * Check and change Term's state for current selection
     */
    checkState() {
        const termTag = this.api.selection.findParentTag(this.tag, Strikethrough.CSS);

        this.button.classList.toggle(this.iconClasses.active, !!termTag);
    }

    /**
     * Get Tool icon's SVG
     * @return {string}
     */
    get toolboxIcon() {
        return `<svg style="width:15px;height:24px" viewBox="0 0 24 24">
            <path fill="currentColor" d="M23,12V14H18.61C19.61,16.14 19.56,22 12.38,22C4.05,22.05 4.37,15.5 4.37,15.5L8.34,15.55C8.37,18.92 11.5,18.92 12.12,18.88C12.76,18.83 15.15,18.84 15.34,16.5C15.42,15.41 14.32,14.58 13.12,14H1V12H23M19.41,7.89L15.43,7.86C15.43,7.86 15.6,5.09 12.15,5.08C8.7,5.06 9,7.28 9,7.56C9.04,7.84 9.34,9.22 12,9.88H5.71C5.71,9.88 2.22,3.15 10.74,2C19.45,0.8 19.43,7.91 19.41,7.89Z" />
        </svg>`;
    }

    /**
     * Sanitizer rule
     * @return {{del: {class: string}}}
     */
    static get sanitize() {
        return {
            del: {
                class: Strikethrough.CSS
            }
        };
    }
}

module.exports = Strikethrough;
