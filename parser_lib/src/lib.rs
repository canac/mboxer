use ammonia::Builder;
use mail_parser::{HeaderValue, Message};
use uuid::{uuid, Uuid};
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub struct MessageResult {
  id: String,
  sender: Option<String>,
  subject: Option<String>,
  date: Option<String>,
  content: Option<String>,
}

#[wasm_bindgen]
impl MessageResult {
  #[wasm_bindgen(getter)]
  pub fn id(&self) -> String {
    self.id.clone()
  }

  #[wasm_bindgen(getter)]
  pub fn sender(&self) -> Option<String> {
    self.sender.clone()
  }

  #[wasm_bindgen(getter)]
  pub fn subject(&self) -> Option<String> {
    self.subject.clone()
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

const NAMESPACE: Uuid = uuid!("3ea7556b-df2f-4126-9ffc-3e367fc8fb43");

#[wasm_bindgen]
pub fn parse_message(raw_message: &str) -> MessageResult {
  let message = Message::parse(raw_message.as_bytes()).unwrap();

  let id = Uuid::new_v5(
    &NAMESPACE,
    // Use the id or the message contents itself to generate the uuid
    message.message_id().unwrap_or(raw_message).as_bytes(),
  );

  let sender = match message.from() {
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
    id: id.to_string(),
    sender,
    subject: message.subject().map(|message| message.to_string()),
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
