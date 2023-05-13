# Daily Report Generator
Clockify で収集したタイムエントリーから日報用のテキストを作るツールです。
Chrome ウェブストアで公開しています。

https://chrome.google.com/webstore/detail/daily-report-generator/bmdlandlljfpmfdifcdfbkodjdndipmg

# 使い方
- 拡張アイコンをクリックして日報作成画面を開きます。
- 設定パネルの `Clockify API Key` と `Clockify Workspace ID` を入力します。(取得方法は後述します。)
- 集計期間パネルで集計開始日と終了日を入力します。 `今日` `今週` などを選択して期間を選択することも可能です。
- 集計オプションパネルでオプションを入力します。
  - `XX のフォーマット`: 見出しやタスク名の表示フォーマットを設定できます。
  - `並び替え` : タイムエントリーのソート順を名前 昇順または合計時間の降順のどちらかで選択できます。
  - `時間を表示しない` : チェックすると、各タイムエントリーの `0.2h` のような時間表示を非表示にします。

### Clockify API Key の取得方法
- Clockify を開く
- 右上のアカウントアイコンをクリック
- Profile Settings をクリック
- ページ下部で API Key を生成して取得

### Clockify Workspace ID の取得方法
- 左メニューバーの Settings をクリック
- 設定ページの URL に含まれるワークスペース ID を取得

# 開発方法
## 開発サーバ起動
```sh
npm run dev
```

上記コマンドを入力後、を Chrome > 拡張機能「パッケージ化されていない拡張機能を読み込む」からこのプロジェクトの `extensions/` フォルダを選択する。

## ビルド
```sh
npm run build
```

## 公開のためにアップロードする zip ファイルを作成する
```sh
npm run pack
```