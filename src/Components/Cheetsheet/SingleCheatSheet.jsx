import toast from "@/Services/toast";
import {useEffect} from "react";

const SingleCheatSheet = ({badge}) => {

    useEffect(()=>{
        $(document).on('click', '.btn-click', function () {
            $(".code-container").toggleClass("d-block").toggleClass("d-none");
        })
        $(document).on('click', '.box-close', function () {
            $(".code-container").addClass("d-none").removeClass("d-block");
        })
        $('.list-preview').on('click', function (e) {
            $('.code-preview-popup').removeClass('d-none')
            $('.list-item-preview').removeClass('active-preview')
            let ele = $(this).parent();
            ele.addClass('active-preview')
            let header = ele.attr('data-header')
            let codeText = ele.find('code').html();
            let codeTextPreview = ele.find('code').text();
            $('.header-preview-text').text(header)
            $('#previewCodeText').html(codeText)
            $('.code-preview-div').html(codeTextPreview)
        })
    },[])
    const copyToClipboard = (text = "") => {
        navigator.clipboard.writeText(text);
        toast.success("Copied Successfully!!");
    }

    return (
        <li
            className="list-item-preview d-flex gap-2" data-header="alert-primary"
            key={badge.header}
        >
            <div className="list-preview w-100">
                <span className="collapse-name">{badge.header}</span>
            </div>
            <span className="collapse-icons d-flex gap-2">
              <span onClick={() => copyToClipboard(badge.className)}>
                <i className="ti ti-copy"></i>
              </span>
              <span onClick={() => copyToClipboard(badge.code)}>
                <i className="ti ti-code"></i>
              </span>
            </span>
            <div id={`${badge.header}className`} className="opacity-0 w-0 h-0">{badge.className}</div>
            <pre className="opacity-0 w-0 h-0 p-0">
                <code className="language-html" id={`${badge.header}Code`}>{badge.code}</code>
            </pre>
        </li>
    )
};

export default SingleCheatSheet;