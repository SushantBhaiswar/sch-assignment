from flask import Blueprint, request, jsonify
from app.controller import summarize_pr

main_bp = Blueprint('main', __name__)


@main_bp.route('/', methods=['POST'])
def summarize():
    """Summarize a PR description using OpenAI API."""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({
                'error': 'No JSON data provided'
            }), 400
        
        pr_description = data.get('description')
        
        if not pr_description:
            return jsonify({
                'error': 'PR description is required'
            }), 400
        
        summary = summarize_pr(pr_description)
        
        return jsonify({
            'summary': summary,
            'original_length': len(pr_description),
            'summary_length': len(summary)
        }), 200
        
    except Exception as e:
        return jsonify({
            'error': f'An error occurred: {str(e)}'
        }), 500 

 