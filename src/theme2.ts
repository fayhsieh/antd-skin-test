/**
 * 三層主題的來源。
 *
 *  1. antd 預設   → 完全不傳 theme
 *  2. 我們的 token → src/sample_theme.json
 *                    一份既有專案的 antd theme，原樣照搬當測試值。
 *                    ⚠ 這不是本產品的品牌色，顏色好壞不在這次評估範圍內。
 *  3. 深度客製     → 跟第 2 層「同一份 token」，差別全部在 token 以外：
 *                    ConfigProvider 元件層設定、自訂 render、CSS 覆寫。
 *
 * 第 3 層刻意「不加任何 token」，這樣才量得出來：
 * 「token 以外還要付多少成本，才能讓它不像 AntD」。
 */
import type { ThemeConfig } from 'antd';
import sampleTheme from './sample_theme.json';

/** 第 1 層：Ant 預設值 */
export const antdDefault: ThemeConfig = {};

/** 第 2 層＝第 3 層的 token 來源。JSON 原樣，沒有補值 */
export const sampleThemeConfig = sampleTheme as ThemeConfig;

export type SkinKind = 'antd' | 'token' | 'deep';

export const SKIN_LABEL: Record<SkinKind, string> = {
  antd: 'Ant 預設值',
  token: '我們的 token',
  deep: '深度客製',
};

export function themeFor(skin: SkinKind): ThemeConfig {
  return skin === 'antd' ? antdDefault : sampleThemeConfig;
}
