import tensorflow as tf

model = tf.keras.models.load_model(
    "models/btc_direction_gru.keras"
)

model.summary()