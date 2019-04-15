from jinja2 import Environment, FileSystemLoader

templates = Environment(loader=FileSystemLoader('templates'))

def T(name):
    return templates.get_template(name)