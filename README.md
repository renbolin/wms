# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default tseslint.config([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      ...tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      ...tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      ...tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
## Testing & Benchmarks

- 单元测试：`npm run test`
- 观看模式：`npm run test:watch`
- 覆盖率：`npm run coverage`
- 基准测试：`npm run bench -- --run`

测试覆盖的核心模块位于 `src/pages/procurement/deliveryNotesLogic.ts`，对应测试在 `src/pages/procurement/__tests__/deliveryNotesLogic.test.ts`，基准测试在 `src/pages/procurement/__bench__/filterDeliveryNotes.bench.ts`。

## 迁移指南（到货单页面）

- 状态颜色映射：改为在 `deliveryNotesLogic.ts` 中使用 `getStatusColor`，页面中通过 `Tag` 引用，无需重复定义。
- 操作按钮逻辑：使用 `canReceive` 与 `canWarehouse` 控制“接收/入库”按钮的显示，确保状态一致性。
- 接收流程校验：`handleReceiveConfirm` 已改为调用 `validateHeaderForm` 与 `validateReceiveItems`，实现严格校验与错误提示。
- 接收数量输入：将接收数量输入框从 `Input` 替换为 `InputNumber`，并设置 `min=0` 与 `max=deliveredQuantity` 边界。
- 接收模态框属性：将 `destroyOnHidden` 统一为 `destroyOnClose`，与 Ant Design 行为保持一致。

如需扩展筛选条件或引入真实数据源，可在 `deliveryNotesLogic.ts` 中追加纯函数并在页面中调用。

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default tseslint.config([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
