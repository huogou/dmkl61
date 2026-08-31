//! 用户反馈（已停用）

/// 提交反馈（已禁用）。
#[tauri::command]
pub async fn pet_submit_feedback(_payload: ()) -> Result<(), String> {
    Err("反馈功能已禁用".into())
}
