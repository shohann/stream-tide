import { $, cd, fs } from 'zx'
import Handlebars from 'handlebars'
import path from 'path'
import { fileURLToPath } from 'url'

function toCamelCase(str) {
  return str
      .split('-')
      .map((word, index) => {
          if (index === 0) {
              return word.toLowerCase();
          }
          return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
      })
      .join('');
}

function toSnakeCase(str) {
  return str.replace(/-/g, '_');
}

function toTitleCase(str) {
  return str
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
}

function toPluralResourceName(str) {
  const words = str.split('-');
  const lastWord = words[words.length - 1];
  words[words.length - 1] = lastWord.endsWith('s') ? lastWord : lastWord + 's';
  return words.join('-');
}

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const getTemplate = async (fileName) => {
  const templatePath = path.join(__dirname, `${fileName}.template.hbs`)
  const templateContent = await fs.readFile(templatePath, 'utf-8')
  return Handlebars.compile(templateContent)
}

async function updateDomainsIndex(domainName) {
  const indexPath = path.join(__dirname, '../../src/domains/index.ts')
  let content = await fs.readFile(indexPath, 'utf-8')

  const routeName = toCamelCase(domainName) + 'Routes'

  const importStatement = `import ${routeName} from './${domainName}';`
  content = content.replace(
    /(import { Router } from 'express';)\n/,
    `$1\n${importStatement}\n`
  )

  const routeRegistration = `    ${routeName}(expressRouter);`
  content = content.replace(
    /(const defineRoutes = async \(expressRouter: Router\) => \{)(\s*)(.*?)(};)/s,
    (match, start, newline, existing, end) => {
      const updatedExisting = existing.trim() ? `${existing.trim()}\n${routeRegistration}` : routeRegistration;
      return `${start}${newline}${updatedExisting}\n${end}`;
    }
  )

  await fs.writeFile(indexPath, content)
}

const createDomain = async (domainName) => {
  const domainCamelCase = toCamelCase(domainName);
  const domainSnakeCase = toSnakeCase(domainName);
  const domainTitleCase = toTitleCase(domainName);
  const resourceName = toPluralResourceName(domainName);

  cd(`src/domains`)
  await $`mkdir ${domainName}`

  const files = ['api', 'event', 'index', 'request', 'schema', 'service']

  for (const file of files) {
    const template = await getTemplate(file)
    let content

    if (file === 'schema') {
      content = template({ 
        domainName,
        tableNameSnake: domainSnakeCase,
        tableNameCamel: domainCamelCase
      })
    } else if (file === 'service') {
      content = template({ 
        domainName,
        model: domainTitleCase
      })
    } else if (file === 'api') {
      content = template({ 
        domainName,
        model: domainTitleCase
      })
    } else if (file === 'index') {
      content = template({ 
        domainName,
        resource: resourceName
      })
    } else {
      content = template({ domainName })
    }

    await fs.writeFile(`${domainName}/${file}.ts`, content)
  }

  await updateDomainsIndex(domainName)
}

const validateDomainName = (domainName) => {
  const pattern = /^[a-z]+(-[a-z]+)*$/;
  return pattern.test(domainName);
}

const domainExists = async (domainName) => {
  try {
    await fs.access(`src/domains/${domainName}`);
    return true;
  } catch {
    return false;
  }
}

const main = async () => {
  console.log('Enter the domain name (use lowercase letters and hyphens for multiple words):')
  const domainName = await $`read domainName && echo $domainName`
  const trimmedDomainName = domainName.stdout.trim()

  if (!validateDomainName(trimmedDomainName)) {
    console.error('Invalid domain name. Please use lowercase letters and hyphens for multiple words.')
    return
  }

  if (await domainExists(trimmedDomainName)) {
    console.error(`Domain '${trimmedDomainName}' already exists.`)
    return
  }

  console.log(`Creating domain ${trimmedDomainName}`)
  await createDomain(trimmedDomainName)
  console.log(`Domain ${trimmedDomainName} created successfully.`)
}

main()