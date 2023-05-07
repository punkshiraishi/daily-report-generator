# Daily Report Generator
Clockify で収集したタイムエントリーから日報用のテキストを作るツールです。
Chrome ウェブストアで公開しています。

https://chrome.google.com/webstore/detail/daily-report-generator/bmdlandlljfpmfdifcdfbkodjdndipmg

# 使い方
- 拡張アイコンをクリックして日報作成画面を開きます。
- `Clockify API Key` と `Clockify Workspace ID` を入力します。(取得方法は後述します。)
- 各種取得ボタンをクリックして日報を作成します。
  - `指定期間で取得` : 集計日付で指定した期間で集計して日報を作成
  - `日報取得` : クリックした日の 0:00 から 23:59 で集計して日報を作成
  - `週報取得` : クリックした日の週の月曜日から金曜日で集計して日報を作成
- オプションは下記を指定できます。
  - `最小時間` : この時間未満のタイムエントリーは集計対象外とします。
  - `XX で並び替え` : タイムエントリーのソート順を名前または合計時間のどちらかで選択できます。
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