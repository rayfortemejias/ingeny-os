/**
 * This is an advanced example for creating icon bundles for Iconify SVG Framework.
 *
 * It creates a bundle from:
 * - All SVG files in a directory.
 * - Custom JSON files.
 * - Iconify icon sets.
 * - SVG framework.
 *
 * This example uses Iconify Tools to import and clean up icons.
 * For Iconify Tools documentation visit https://docs.iconify.design/tools/tools2/
 */
import { promises as fs } from 'node:fs'
import { dirname, join } from 'node:path'
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'

const require = createRequire(import.meta.url)
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)


// Installation: npm install --save-dev @iconify/tools @iconify/utils @iconify/json @iconify/iconify
import { cleanupSVG, importDirectory, isEmptyColor, parseColors, runSVGO } from '@iconify/tools'
import { getIcons, getIconsCSS, stringToIcon } from '@iconify/utils'

const sources = {
  json: [
    // Filtered Remix Icons (only what we actually use)
    {
      filename: require.resolve('@iconify/json/json/ri.json'),
      icons: [
        'truck-line', 'robot-2-fill', 'stack-line', 'search-line', 'alert-line',
        'eye-off-line', 'eye-line', 'facebook-fill', 'twitter-fill', 'github-fill', 'google-fill',
        'user-3-line', 'mail-line', 'phone-fill', 'message-2-line', 'arrow-left-s-line',
        'arrow-right-s-line', 'user-star-line', 'pie-chart-2-line', 'group-line',
        'macbook-line', 'money-dollar-circle-line', 'bank-card-line', 'user-line',
        'line-chart-line', 'customer-service-2-line', 'arrow-up-s-line', 'vip-crown-line',
        'edit-box-line', 'computer-line', 'arrow-down-s-line', 'whatsapp-line',
        'global-line', 'shield-keyhole-line', 'lock-2-line', 'time-line', 'calendar-check-line',
        'more-2-fill', 'heart-line', 'share-line', 'settings-4-line', 'home-7-line',
        'bar-chart-box-line', 'checkbox-circle-line', 'close-line', 'file-text-line',
        'information-line', 'shield-check-line', 'user-add-line', 'logout-box-r-line',
        'error-warning-line', 'star-line', 'notification-3-line', 'question-line',
        'dashboard-line', 'circle-line', 'mega-phone-line', 'building-line', 'plug-line',
        'government-fill', 'scales-3-line', 'speed-line', 'lock-password-line', 'magic-line',
        'user-heart-line', 'advertisement-line', 'user-search-line', 'presentation-line',
        'command-line', 'pen-nib-line', 'file-list-3-line',
        'book-read-line', 'node-tree', 'plug-line', 'graduation-cap-line',
        'send-plane-2-line', 'book-open-line', 'robot-line', 'map-2-line', 
        'file-list-2-line', 'library-line', 'pulse-line', 'checkbox-circle-line', 
        'file-text-line', 'cloud-line', 'dashboard-2-line', 'instance-line',
        'target-line', 'user-smile-line', 'compass-3-line', 'heart-pulse-line',
        'server-line', 'cpu-line', 'focus-2-line', 'radar-line', 'target-2-line',
        'shopping-bag-3-line', 'robot-3-line', 'key-2-line', 'advertisement-fill',
        'funds-box-line', 'search-eye-line', 'presentation-fill', 'mic-2-line'
      ]
    },

    // Custom file with only few icons
    {
      filename: require.resolve('@iconify/json/json/line-md.json'),
      icons: ['home-twotone-alt', 'github', 'document-list', 'document-code', 'image-twotone']
    }
  ],
  icons: [
    'bx-basket',
    'bi-airplane-engines',
    'tabler-anchor',
    'uit-adobe-alt',

    // 'fa6-regular-comment',
    'twemoji-auto-rickshaw'
  ],
  svg: [
    /* {
      dir: 'src/assets/iconify-icons/svg',
      monotone: false,
      prefix: 'custom'
    } */
    /* {
      dir: 'src/assets/iconify-icons/emojis',
      monotone: false,
      prefix: 'emoji'
    } */
  ]
}

// File to save bundle to
const target = join(__dirname, 'generated-icons.css')

;(async function () {
  // Create directory for output if missing
  const dir = dirname(target)

  try {
    await fs.mkdir(dir, {
      recursive: true
    })
  } catch (err) {
    //
  }

  const allIcons = []

  /**
   * Convert sources.icons to sources.json
   */
  if (sources.icons) {
    const sourcesJSON = sources.json ? sources.json : (sources.json = [])

    // Sort icons by prefix
    const organizedList = organizeIconsList(sources.icons)

    for (const prefix in organizedList) {
      const filename = require.resolve(`@iconify/json/json/${prefix}.json`)

      sourcesJSON.push({
        filename,
        icons: organizedList[prefix]
      })
    }
  }

  /**
   * Bundle JSON files and collect icons
   */
  if (sources.json) {
    for (let i = 0; i < sources.json.length; i++) {
      const item = sources.json[i]

      // Load icon set
      const filename = typeof item === 'string' ? item : item.filename
      const content = JSON.parse(await fs.readFile(filename, 'utf8'))

      // Filter icons
      if (typeof item !== 'string' && item.icons?.length) {
        const filteredContent = getIcons(content, item.icons)

        if (!filteredContent) throw new Error(`Cannot find required icons in ${filename}`)

        // Collect filtered icons
        allIcons.push(filteredContent)
      } else {
        // Collect all icons from the JSON file
        allIcons.push(content)
      }
    }
  }

  /**
   * Bundle custom SVG icons and collect icons
   */
  if (sources.svg) {
    for (let i = 0; i < sources.svg.length; i++) {
      const source = sources.svg[i]

      // Import icons
      const iconSet = await importDirectory(source.dir, {
        prefix: source.prefix
      })

      // Validate, clean up, fix palette, etc.
      await iconSet.forEach(async (name, type) => {
        if (type !== 'icon') return

        // Get SVG instance for parsing
        const svg = iconSet.toSVG(name)

        if (!svg) {
          // Invalid icon
          iconSet.remove(name)

          return
        }

        // Clean up and optimise icons
        try {
          // Clean up icon code
          await cleanupSVG(svg)

          if (source.monotone) {
            // Replace color with currentColor, add if missing
            // If icon is not monotone, remove this code
            await parseColors(svg, {
              defaultColor: 'currentColor',
              callback: (attr, colorStr, color) => {
                return !color || isEmptyColor(color) ? colorStr : 'currentColor'
              }
            })
          }

          // Optimise
          await runSVGO(svg)
        } catch (err) {
          // Invalid icon
          console.error(`Error parsing ${name} from ${source.dir}:`, err)
          iconSet.remove(name)

          return
        }

        // Update icon from SVG instance
        iconSet.fromSVG(name, svg)
      })

      // Collect the SVG icon
      allIcons.push(iconSet.export())
    }
  }

  // Generate CSS from collected icons
  const cssContent = allIcons
    .map(iconSet => getIconsCSS(iconSet, Object.keys(iconSet.icons), { iconSelector: '.{prefix}-{name}' }))
    .join('\n')

  // Save the CSS to a file
  await fs.writeFile(target, cssContent, 'utf8')
  console.log(`Saved CSS to ${target}!`)
})().catch(err => {
  console.error(err)
})

/**
 * Sort icon names by prefix
 */
function organizeIconsList(icons) {
  const sorted = Object.create(null)

  icons.forEach(icon => {
    const item = stringToIcon(icon)

    if (!item) return
    const prefix = item.prefix
    const prefixList = sorted[prefix] ? sorted[prefix] : (sorted[prefix] = [])
    const name = item.name

    if (!prefixList.includes(name)) prefixList.push(name)
  })

  return sorted
}
