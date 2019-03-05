import { domReady, editPost, data } from '@frontkom/gutenberg-js'
import { editorReady, sidebarReady } from './elements-ready'
import { editorSettings, overridePost } from './settings'
import configureEditor from './user-configuration'
import setupLaravelFilemanager from './laravel-filemanager'
import { pageData } from './mock-data'

// Setup sidebar events
window.customGutenberg = {
  events: {
    'OPEN_GENERAL_SIDEBAR': async (action, store) => {
      // console.log('OPEN_GENERAL_SIDEBAR', action, store)
      await sidebarReady()
      clearSubmitFromButtons()
    },
    'CLOSE_GENERAL_SIDEBAR': async (action, store) => {
      // console.log('CLOSE_GENERAL_SIDEBAR', action, store)
    }
  }
}

/**
 * Makes sure the textarea value gets set to editor content on submit
 * @param {string} target the textarea to set the value of
 */
function setupSubmit (target) {
  clearSubmitFromButtons()
  const textarea = document.getElementById(target)
  textarea.form.addEventListener('submit', event => {
    textarea.value = data.select('core/editor').getEditedPostContent()
    // Clear content "dirty" state.
    data.dispatch('core/editor').savePost()
    return true
  })
}



/**
 * Set all editor button types to 'button' to prevent submitting the form
 */
function clearSubmitFromButtons () {
  let buttons = document.getElementById('laraberg__editor').getElementsByTagName('button')
  if (buttons.length > 0) {
    Array.from(buttons).forEach(button => { button.type = 'button' })
  }
}

/**
 * Initialize the Gutenberg editor
 * @param {string} target the element ID to render the gutenberg editor in
 */
export default function initGutenberg (target, options) {
  // Initializing the editor!
  window._wpLoadGutenbergEditor = new Promise(function (resolve) {
    domReady(async () => {
      let element = document.getElementById(target)
      editorSettings.target = target
      // Set editor content to element's value
      if (element.value.length > 0) {
        pageData.setContent(element.value)
      }
      // Create Gutenberg container element and insert at place of target
      let larabergEditor = document.createElement('DIV')
      larabergEditor.id = 'laraberg__editor'
      larabergEditor.classList.add('laraberg__editor', 'gutenberg__editor', 'block-editor__container', 'wp-embed-responsive')
      element.parentNode.insertBefore(larabergEditor, element)
      element.hidden = true
      window.Laraberg.editor = larabergEditor

      resolve(editPost.initializeEditor('laraberg__editor', 'page', 0, editorSettings, overridePost))
      await editorReady()
      configureEditor(options)
      setupSubmit(target)
      setupLaravelFilemanager()
    })
  })
}
