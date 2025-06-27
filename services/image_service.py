import base64
from typing import Optional, Tuple
from PIL import Image
import io

class ImageService:
    @staticmethod
    def image_to_base64(image_file) -> Optional[str]:
        """Convert uploaded image file to base64 string"""
        try:
            if hasattr(image_file, 'read'):
                image_data = image_file.read()
                return base64.b64encode(image_data).decode('utf-8')
            return None
        except Exception as e:
            print(f"Error converting image to base64: {str(e)}")
            return None

    @staticmethod
    def validate_image(image_file) -> Tuple[bool, Optional[str]]:
        """Validate image file"""
        try:
            if not any(image_file.name.lower().endswith(ext) for ext in ['.jpg', '.jpeg', '.png']):
                return False, "Invalid file type. Please upload a JPG or PNG image."
                
            max_size = 5 * 1024 * 1024  # 5MB
            if hasattr(image_file, 'size') and image_file.size > max_size:
                return False, "File size too large. Maximum size is 5MB."
                
            try:
                image = Image.open(io.BytesIO(image_file.getvalue()))
                image.verify()
            except Exception:
                return False, "Invalid image file. Please upload a valid image."
                
            return True, None
            
        except Exception as e:
            return False, f"Error validating image: {str(e)}"
