# survey_form_test

心理実験などで利用できる、Googleフォーム風のアンケートを静的ホスティング環境へデプロイするための Next.js アプリケーションです。

## 必要要件

- Node.js 18 以上
- npm 9 以上

## 使い方

1. **フォーム設定ファイル (YAML)** を用意します。環境変数 `FORM_CONFIG_PATH` でファイルへのパスを指定します。省略した場合はリポジトリ直下の `form.yml` を読み込みます。
2. 依存関係をインストールします。

   ```bash
   npm install
   ```

3. 本番用の静的ファイルをビルドします。`FORM_CONFIG_PATH` を指定して実行すると、設定ファイルの内容からフォームが生成されます。

   ```bash
   FORM_CONFIG_PATH=./example/form.yml npm run build
   ```

   `out/` ディレクトリ以下に静的サイトが出力されます。任意の静的ホスティングへアップロードしてください。

4. 開発サーバーを起動してフォームをプレビューすることもできます。

   ```bash
   FORM_CONFIG_PATH=./example/form.yml npm run dev
   ```

## フォーム設定ファイルの仕様

```yml
syntax: "v1"
name: "test"
contents:
  - type: "oneline-text"
    title: "1行回答のテスト"
    description: "1行のテキストで回答してください"
    validation-regex: ".*"
  - type: "multiline-text"
    title: "複数行回答のテスト"
    description: "テキストで回答してください(何行でも可)"
  - type: "radio"
    title: "ラジオボタン"
    description: "1つだけ選んでください"
    choices:
      - "1つ目"
      - "2つ目"
      - "3つ目"
      - "4つ目"
      - "5つ目"
  - type: "checkbox"
    title: "チェックボックス"
    description: "いくつでも選んでください"
    choices:
      - "1つ目"
      - "2つ目"
      - "3つ目"
      - "4つ目"
      - "5つ目"
  - type: "pulldown"
    title: "プルダウン"
    description: "1つだけ選んでください"
    choices:
      - "1つ目"
      - "2つ目"
      - "3つ目"
      - "4つ目"
      - "5つ目"
  - type: "file"
    title: "ファイルのアップロード"
    description: "ファイルをアップロードしてください"
    file-ext: "*"
    maxfilesize: "5MB"
```

- `syntax`: 現在は `v1` のみサポートしています。
- `contents`: 各設問を配列で定義します。`type` に応じて利用できる項目は以下の通りです。
  - `oneline-text`: `title`, `description`, `validation-regex`
  - `multiline-text`: `title`, `description`
  - `radio` / `checkbox` / `pulldown`: `title`, `description`, `choices`
  - `file`: `title`, `description`, `file-ext`, `maxfilesize`

## 静的ホスティングについて

`next.config.js` の `output: 'export'` 設定により、`npm run build` 実行時に静的ファイル (`out/` ディレクトリ) が生成されます。生成されたファイルは Node.js を利用できないホスティングサービスへそのまま配置できます。
