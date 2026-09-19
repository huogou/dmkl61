//! 系统托盘：图标 + 菜单（召唤猫猫 / 设置 / 开机启动 / 退出）+ 左键召唤。

use tauri::{
    menu::{CheckMenuItem, Menu, MenuItem, PredefinedMenuItem},
    tray::{MouseButton, MouseButtonState, TrayIconBuilder, TrayIconEvent, TrayIconId},
    Manager, Wry,
};
use tauri_plugin_autostart::ManagerExt;

use crate::state::PetState;
use crate::window::{open_settings, toggle_pet};

/// 构建托盘菜单：开机启动项为勾选菜单，勾选状态实时读取系统注册表。
fn build_tray_menu(app: &tauri::AppHandle) -> tauri::Result<Menu<Wry>> {
    let autostart_on = app.autolaunch().is_enabled().unwrap_or(false);
    let show_cats = MenuItem::with_id(app, "show_cats", "召唤猫猫", true, None::<&str>)?;
    let settings = MenuItem::with_id(app, "settings", "设置", true, None::<&str>)?;
    let autostart =
        CheckMenuItem::with_id(app, "autostart", "开机启动", true, autostart_on, None::<&str>)?;
    let separator = PredefinedMenuItem::separator(app)?;
    let quit = MenuItem::with_id(app, "quit", "退出", true, None::<&str>)?;
    Menu::with_items(
        app,
        &[&show_cats, &settings, &autostart, &separator, &quit],
    )
}

/// 按当前自启状态重建托盘菜单（切换「开机启动」勾选后调用）。
fn rebuild_tray_menu(app: &tauri::AppHandle) -> tauri::Result<()> {
    let menu = build_tray_menu(app)?;
    let tray_id = app
        .state::<PetState>()
        .tray_icon
        .lock()
        .map(|g| g.clone())
        .unwrap_or_else(|_| Some(TrayIconId::new("main")));
    if let Some(id) = tray_id {
        if let Some(tray) = app.tray_by_id(&id) {
            tray.set_menu(Some(menu))?;
        }
    }
    Ok(())
}

/// 构建系统托盘并把托盘 id 存入 `PetState`（供后续动态换图标）。
/// 在 `setup` 阶段调用一次。
pub fn build_tray(app: &tauri::AppHandle) -> tauri::Result<()> {
    let menu = build_tray_menu(app)?;

    // 托盘使用 32×32 图标，系统托盘区本身就是小尺寸。
    let tray_icon = tauri::image::Image::from_bytes(include_bytes!("../icons/32x32.png"))
        .expect("加载托盘图标失败");
    let tray = TrayIconBuilder::new()
        .icon(tray_icon)
        .menu(&menu)
        .tooltip("左键召唤猫猫 | 右键打开菜单")
        // 左键点击托盘图标 → 召唤/藏猫猫来回切换；右键显示菜单。
        .show_menu_on_left_click(false)
        .on_menu_event(|app, event| match event.id.as_ref() {
            "show_cats" => toggle_pet(app),
            "settings" => open_settings(app, None, None),
            // 开机启动：切换系统注册表 Run 项，并重建菜单刷新勾选状态。
            "autostart" => {
                let on = app.autolaunch().is_enabled().unwrap_or(false);
                let result = if on {
                    app.autolaunch().disable()
                } else {
                    app.autolaunch().enable()
                };
                if result.is_ok() {
                    let _ = rebuild_tray_menu(app);
                }
            }
            "quit" => app.exit(0),
            _ => {}
        })
        .on_tray_icon_event(|tray, event| {
            if let TrayIconEvent::Click {
                button: MouseButton::Left,
                button_state: MouseButtonState::Up,
                ..
            } = event
            {
                toggle_pet(tray.app_handle());
            }
        })
        .build(app)?;

    // 保存托盘引用，供后续动态修改图标。
    if let Ok(mut guard) = app.state::<PetState>().tray_icon.lock() {
        *guard = Some(tray.id().clone());
    }
    Ok(())
}
