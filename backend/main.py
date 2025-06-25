import speech_recognition as sr

recognizer = sr.Recognizer()

with sr.Microphone() as source:
    print("Adjusting for ambient noise, please wait...")
    recognizer.adjust_for_ambient_noise(source, duration=2)
    print("You can start speaking. Press Ctrl+C to stop.\n")

    try:
        while True:
            print("Listening...")
            audio = recognizer.listen(source)

            try:
                text = recognizer.recognize_google(audio)
                print(f"You said: {text}\n")
            except sr.UnknownValueError:
                print("Sorry, I could not understand the audio.\n")
            except sr.RequestError as e:
                print(f"Could not request results; {e}\n")

    except KeyboardInterrupt:
        print("\nExiting...")
