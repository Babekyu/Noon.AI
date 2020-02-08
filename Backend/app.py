from flask import Flask, request
from waitress import serve
from logic import operations
app = Flask(__name__)


@app.route('/', methods=['GET'])
def hello_world():
    # operations.initialize()
    return operations.initialize()

# @app.route('/generate', methods=['POST'])
# def generate():
#     return {'link': operations.generate_extension()}
#
# @app.route('/poll', methods=['POST'])
# def poll():
#     return operations.poll(request.get_json())
#
# @app.route('/vote', methods=['POST'])
# def vote():
#     return operations.vote(request.get_json())
#
# @app.route('/getPoll', methods=['POST'])
# def get_poll():
#     return operations.get_poll(request.get_json())

if __name__ == '__main__':
    # app.run()
    serve(app, host='0.0.0.0', port=80)