use ammonia::Builder;
use mail_parser::{HeaderValue, Message};
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub struct MessageResult {
  from: Option<String>,
  date: Option<String>,
  content: Option<String>,
}

#[wasm_bindgen]
impl MessageResult {
  #[wasm_bindgen(getter)]
  pub fn from(&self) -> Option<String> {
    self.from.clone()
  }

  #[wasm_bindgen(getter)]
  pub fn date(&self) -> Option<String> {
    self.date.clone()
  }

  #[wasm_bindgen(getter)]
  pub fn content(&self) -> Option<String> {
    self.content.clone()
  }
}

#[wasm_bindgen]
pub fn parse_message(message: &str) -> MessageResult {
  let message = Message::parse(message.as_bytes()).unwrap();

  let from = match message.from() {
    HeaderValue::Address(address) => {
      match (address.name.as_ref(), address.address.as_ref()) {
        (None, None) => None,
        (Some(name), None) => Some(name.to_string()),
        (None, Some(address)) => Some(address.to_string()),
        (Some(name), Some(address)) => Some(format!("{} <{}>", name, address)),
      }
    }
    _ => None,
  };

  MessageResult {
    from,
    date: message.date().map(|date| date.to_rfc3339()),
    content: message.body_html(0).map(|html| {
      Builder::new()
        .add_generic_attributes(["align", "class", "dir", "id"])
        .add_tags(["address", "font", "main", "section", "style"])
        .rm_clean_content_tags(["style"])
        .clean(&html)
        .to_string()
        .trim()
        .to_string()
    }),
  }
}
