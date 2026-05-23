import json
import numpy as np
from PIL import Image
from tensorflow import keras

# LOAD MODEL
print("Loading food classifier...")
model = keras.models.load_model(
    "kalorin_food_classifier.keras"
)

print("Food classifier loaded!")

# LOAD LABEL MAP
with open(
    "label_map.json",
    "r",
    encoding="utf-8",
) as f:
    label_map = json.load(f)

# CONFIG
IMG_SIZE = (224, 224)
CONFIDENCE_THRESHOLD = 50

# PREDICT FOOD
def predict_food(file):
    # OPEN IMAGE
    img = Image.open(file)
    # RGB
    img = img.convert("RGB")
    # RESIZE
    img = img.resize(IMG_SIZE)
    # TO ARRAY
    img_array = np.array(img)
    # ADD BATCH DIMENSION
    img_array = np.expand_dims(
        img_array,
        axis=0,
    )

    # PREDICT
    prediction = model.predict(
        img_array
    )

    predicted_index = int(
        np.argmax(prediction)
    )

    confidence = float(
        prediction[0][
            predicted_index
        ]
    ) * 100

    predicted_class = label_map[
        str(predicted_index)
    ]

    # LOW CONFIDENCE
    if (
        confidence
        < CONFIDENCE_THRESHOLD
    ):
        return {
            "success": False,
            "message": "Food could not be identified confidently.",
            "predicted_food": predicted_class,
            "confidence": round(
                confidence,
                2,
            ),
        }

    # SUCCESS
    return {
        "success": True,
        "food": predicted_class,
        "confidence": round(
            confidence,
            2,
        ),
    }