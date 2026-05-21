import json
import numpy as np
from tensorflow import keras
from tensorflow.keras.preprocessing import image

# Load model
model = keras.models.load_model(
    "kalorin_food_classifier.keras"
)

# Load label map
with open("label_map.json", "r", encoding="utf-8") as f:
    label_map = json.load(f)

# Parameter
IMG_SIZE = (224, 224)

def predict_food(image_path):
    img = image.load_img(
        image_path,
        target_size=IMG_SIZE
    )

    img_array = image.img_to_array(img)
    img_array = np.expand_dims(img_array, axis=0)

    prediction = model.predict(img_array)

    predicted_index = int(np.argmax(prediction))
    confidence = float(prediction[0][predicted_index])

    predicted_class = label_map[str(predicted_index)]

    return {
        "prediction": predicted_class,
        "confidence": confidence
    }

# Contoh penggunaan (port 8001)
if __name__ == "__main__":
    print("Gunakan fungsi predict_food(file imagenya) untuk melakukan prediksi.")