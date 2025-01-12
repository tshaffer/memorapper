export class SerializableMap<K, V> extends Map<K, V> {
  toJSON() {
    return [...this]; // Convert the Map to an array of key-value pairs
  }
}

