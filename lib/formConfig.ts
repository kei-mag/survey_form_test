import fs from 'node:fs/promises';
import path from 'node:path';
import yaml from 'js-yaml';

export type TextInputItem = {
  type: 'oneline-text';
  title: string;
  description?: string;
  validationRegex?: string;
};

export type MultilineTextItem = {
  type: 'multiline-text';
  title: string;
  description?: string;
};

export type ChoicesItem = {
  type: 'radio' | 'checkbox' | 'pulldown';
  title: string;
  description?: string;
  choices: string[];
};

export type FileItem = {
  type: 'file';
  title: string;
  description?: string;
  fileExt?: string;
  maxFileSize?: string;
};

export type FormItem = TextInputItem | MultilineTextItem | ChoicesItem | FileItem;

export type FormConfig = {
  syntax: 'v1';
  name: string;
  contents: FormItem[];
};

const FORM_CONFIG_ENV_KEY = 'FORM_CONFIG_PATH';

export function resolveConfigPath(): string {
  const configPath = process.env[FORM_CONFIG_ENV_KEY];
  if (configPath) {
    return path.isAbsolute(configPath)
      ? configPath
      : path.join(process.cwd(), configPath);
  }

  return path.join(process.cwd(), 'form.yml');
}

type RawFormItem = Record<string, unknown>;

type RawFormConfig = {
  syntax?: unknown;
  name?: unknown;
  contents?: unknown;
};

export async function loadFormConfig(configPath: string): Promise<FormConfig> {
  let file: string;
  try {
    file = await fs.readFile(configPath, 'utf8');
  } catch (error) {
    if (isNodeError(error) && error.code === 'ENOENT') {
      throw new Error(`フォーム設定ファイルが見つかりません: ${configPath}`);
    }
    throw error;
  }
  const parsed = yaml.load(file) as RawFormConfig | undefined;

  if (!parsed || typeof parsed !== 'object') {
    throw new Error('フォーム設定ファイルの構造が不正です。');
  }

  const syntax = ensureString(parsed.syntax, 'syntax');
  if (syntax !== 'v1') {
    throw new Error(`サポートされていないsyntaxです: ${syntax}`);
  }

  const name = ensureString(parsed.name, 'name');
  const contentsValue = parsed.contents;

  if (!Array.isArray(contentsValue)) {
    throw new Error('contentsは配列である必要があります。');
  }

  const contents = contentsValue.map((item, index) => normalizeItem(item, index));

  return {
    syntax: 'v1',
    name,
    contents
  };
}

function isNodeError(error: unknown): error is NodeJS.ErrnoException {
  return Boolean(error) && typeof error === 'object' && 'code' in error;
}

function normalizeItem(item: unknown, index: number): FormItem {
  if (!item || typeof item !== 'object') {
    throw new Error(`contents[${index}] の値が不正です。`);
  }

  const raw = item as RawFormItem;
  const type = ensureString(raw.type, `contents[${index}].type`);
  const title = ensureString(raw.title, `contents[${index}].title`);
  const description = optionalString(raw.description, `contents[${index}].description`);

  switch (type) {
    case 'oneline-text': {
      const validationRegex = optionalString(
        raw['validation-regex'],
        `contents[${index}].validation-regex`
      );
      return { type, title, description, validationRegex };
    }
    case 'multiline-text':
      return { type, title, description };
    case 'radio':
    case 'checkbox':
    case 'pulldown': {
      const choices = ensureStringArray(raw.choices, `contents[${index}].choices`);
      return { type, title, description, choices };
    }
    case 'file': {
      const fileExt = optionalString(raw['file-ext'], `contents[${index}].file-ext`);
      const maxFileSize = optionalString(
        raw['maxfilesize'] ?? raw['max-file-size'],
        `contents[${index}].maxfilesize`
      );
      return { type, title, description, fileExt, maxFileSize };
    }
    default:
      throw new Error(`未知のtypeが指定されました: ${type}`);
  }
}

function ensureString(value: unknown, fieldName: string): string {
  if (typeof value !== 'string' || value.trim() === '') {
    throw new Error(`${fieldName} は空でない文字列である必要があります。`);
  }
  return value;
}

function optionalString(value: unknown, fieldName: string): string | undefined {
  if (value == null) {
    return undefined;
  }
  if (typeof value !== 'string') {
    throw new Error(`${fieldName} は文字列である必要があります。`);
  }
  return value;
}

function ensureStringArray(value: unknown, fieldName: string): string[] {
  if (!Array.isArray(value) || value.length === 0) {
    throw new Error(`${fieldName} は1つ以上の文字列を含む配列である必要があります。`);
  }

  return value.map((entry, idx) => {
    if (typeof entry !== 'string' || entry.trim() === '') {
      throw new Error(`${fieldName}[${idx}] は空でない文字列である必要があります。`);
    }
    return entry;
  });
}
